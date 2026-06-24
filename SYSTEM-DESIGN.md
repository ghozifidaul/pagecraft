# PageCraft System Design

**App Title:** StoryBook Generator - PageCraft

**Description:** A web app to help parents generate their own illustration book for their kids with personalized stories.

## User Journey

1. When users visit the PageCraft app, they will arrive at the home page first.
2. To start generating an illustration book, click get started.
3. After the user clicks the get started button, the user will arrive at the book gallery page.
   1. User can click a button to create a new book in the book gallery page.
   2. After clicking the create book button, a dialog will show up, displaying a book creation form.
      1. Put title, character, page number, synopsis, and art style reference in that form to create a new book.
      2. The art style data is in the form of a selection of images that have been provided; users cannot upload their own art style.
      3. Page minimum is 6 pages and maximum is 10 pages.
      4. Synopsis is capped at 2000 words.
   3. Users can delete a book in the gallery page. But a confirmation dialog needs to be added before actually deleting the book.
   4. Users can open a book in the gallery page.
4. After the user submits the book creation form, or clicks the edit button on one of the books in the gallery, the user will move to the Book Crafting Page.
   1. When the user arrives at the Book Crafting Page, AI will start generating the story using title, character, page number, and synopsis. Except when the user wants to edit the book, the page will only open the book and not generate any new story.
   2. The user will review the story; the user can change the story on each page, or regenerate the story on one of the pages.
   3. If the story is good, users can start to generate the illustration on each page. AI will generate the illustration based on character, art style, and story.
      1. Image is not generated all at once.
      2. Image is only generated on each page with a click of a button.
      3. Image is only generated in order (disable the "generate" button for page N+1 until page N succeeds).
      4. If the generation failed, show an error that "illustration generation failed — try again" on the page.
      5. Users can regenerate the illustration with additional feedback input.
   4. Users can't change the book settings such as title, synopsis, page number, art style, and characters.

**Additional Information:**
- Auth is not needed for now. Gallery scoping is fine because this is only used for job applications.

## Data Flow (App Journey)

### a. Book Creation Data Flow

1. User inputs title, synopsis, page count, character, and art style id on the frontend and sends it to the server.
2. The server inputs the book's data (title, synopsis, page count, character, and art style id) to the book's database.
3. Then the server calls an AI API to generate a story per page based on the book's data (title, synopsis, page count, etc).
4. The AI API will return an array of page data such as pageNumber and the pageStory and send the output to the server.
5. The server will input the stories per page to the Pages Database and return the Books data (including the pages) to the Front End.
6. The frontend then fetches the book and pages data and shows them to the User.
7. To generate the image for each page, the frontend will send the Book ID and Page ID to the server.
8. The server will get the book and page data based on the IDs. Then the server sends the art style image, page story, and previous page image (if available) as reference to the AI API to generate the illustration.
9. The image will be stored in storage (Cloudflare R2) and the key will be stored in the page database.
10. Then the server will return the page data such as the page's story and image url to the frontend.
11. The frontend will fetch the page data and show the image to the User.

### b. Page's Story Change Data Flow

1. Users can change each page's story or regenerate with feedback.
2. To change the page story, the user can just update the story and send it to the server.
3. The server will then update the page story, and return the updated data.
4. Then the frontend will fetch the updated data and change the data on the UI.

### c. Page's Story AI Regenerate Data Flow

1. Users input the feedback in the frontend and send it to the server.
2. The server will send the user's feedback and the current page story to the AI API.
3. AI API will return the new story to the server.
4. The server will update the page's database and send the updated data to the frontend.

### d. Page's Illustration Regenerate

1. Users input the feedback on the frontend and send it to the server.
2. The server will send the feedback, current image, current page story, and previous page's image (if available) to the AI.
3. AI will return with the image.
4. The server will store the updated image to the storage and update it on the database.
5. After the database is updated, the server will send the updated data to the frontend.

### e. Book Deletion Data Flow

1. The user confirms deletion via the confirmation dialog on the frontend.
2. The server deletes the book row, which cascades to delete all associated page rows.
3. Before or alongside the DB cascade, the server deletes the corresponding image objects from R2 storage using the stored `image_r2_key` values for each page.
4. The server returns a success response, and the frontend removes the book from the gallery view.

## Tech Stack

### Hono (Back-End)

Reason why I chose this tech for the back-end:
- Ultrafast (10x faster than Express), the fastest router for Cloudflare Workers.
- The developer experience is amazing, AI can be productive using Hono, and the developer will be productive too.

### Vite (Front-End)

Reason why I chose this tech for the front-end:
- Compared to Next.js, it's leaner and lighter, making development more productive.
- AI can be productive with Vite.
- Optimized production build, which means snappy and fast in production.
- Supported by Cloudflare.
- Vite has a large and active dev ecosystem.

### Cloudflare Workers

Reason why I chose this tech for deployment:
- Automatically available world-wide with zero cold start.
- Cost efficient — Cloudflare Workers has a generous limit for the free tier, and I believe the free tier is good enough for this project.
- Zero egress if we use their ecosystem such as D1 and R2.

### Cloudflare D1 (Database)

Reason why I chose this:
- Cost efficient, zero egress on Cloudflare Workers, generous limit for the free tier.
- SQL is fit for this project's data, which is structured data.
- Seamless experience with Cloudflare Workers, meaning less time configuring the database.
- Replicable around the world for lower latency (if needed for production).

### Cloudflare R2 (Storage)

Reason why I chose this:
- Same as D1, cost efficient with a generous limit for the free tier.
- Compatible with the S3 library.
- Zero configuration with Cloudflare Workers.

## API Design

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/art-styles` | Fetches available art presets for the book creation form. |
| GET | `/api/books` | Fetches all books for the main gallery view. |
| POST | `/api/books` | Creates a new book and instantly runs Gemini Flash for the full story script. |
| GET | `/api/books/{id}` | Opens/edits an existing book and reads saved pages without re-triggering AI. |
| DELETE | `/api/books/{id}` | Triggers a cascading purge of the book, all child pages, and their associated R2 image objects. |
| PUT | `/api/books/{id}/pages/{pageId}/story` | Saves manual text changes made by the user. |
| POST | `/api/books/{id}/pages/{pageId}/story/regenerate` | Re-runs Gemini Flash on one page using textual feedback. |
| POST | `/api/books/{id}/pages/{pageId}/illustration` | Generates or regenerates an image with strict order enforcement. |

## Database Design

### 1. `books` Table

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| id | TEXT | PRIMARY KEY | Unique UUID string |
| title | TEXT | NOT NULL | Story book title |
| synopsis | TEXT | NOT NULL | Content foundation |
| character_desc | TEXT | NOT NULL | Prompt boundaries for character consistency |
| page_count | INTEGER | NOT NULL, CHECK (6 to 10) | Book pages |
| art_style_id | TEXT | NOT NULL | — |
| created_at | TEXT | Default: CURRENT_TIMESTAMP | — |

### 2. `pages` Table

| Column | Data Type | Constraints | Description |
|---|---|---|---|
| id | TEXT | PRIMARY KEY | Unique UUID string |
| book_id | TEXT | FOREIGN KEY | Automatic cascading cleanup on parent delete |
| page_number | INTEGER | NOT NULL, UNIQUE(book_id, page_number) | Ordered sequence index (1, 2, 3...) |
| page_story | TEXT | NOT NULL | Story content block |
| image_r2_key | TEXT | NULLABLE | Cloudflare R2 illustration key |
| created_at | TEXT | Default: CURRENT_TIMESTAMP | Individual row tracking anchor |
