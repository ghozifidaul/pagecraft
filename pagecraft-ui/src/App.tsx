import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import BookGallery from "./pages/BookGallery";
import BookCraft from "./pages/BookCraft";

function App() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="create/:bookId" element={<BookCraft />} />
      <Route path="create" element={<BookCraft />} />
      <Route path="gallery" element={<BookGallery />} />
    </Routes>
  );
}

export default App;
