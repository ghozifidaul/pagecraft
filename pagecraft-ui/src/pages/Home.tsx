import { Link } from "react-router";

function Home() {
  return (
    <div>
      <h1>PageCraft</h1>
      <nav>
        <Link to="/create">Create a Book</Link>
        <Link to="/gallery">Browse Gallery</Link>
      </nav>
    </div>
  );
}

export default Home;
