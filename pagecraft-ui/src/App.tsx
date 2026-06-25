import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import BookGallery from "./pages/BookGallery";
import BookCreation from "./pages/BookCreation";

function App() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="create" element={<BookCreation />} />
      <Route path="gallery" element={<BookGallery />} />
    </Routes>
  );
}

export default App;
