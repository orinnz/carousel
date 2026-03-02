import { Carousel } from './components/Carousel/Carousel';
import './App.css';

const mockData = [
  { id: 1, title: 'Slide 1', image: 'https://picsum.photos/id/1015/600/300', landing_page: 'https://example.com/1' },
  { id: 2, title: 'Slide 2', image: 'https://picsum.photos/id/1016/600/300', landing_page: 'https://example.com/2' },
  { id: 3, title: 'Slide 3', image: 'https://picsum.photos/id/1018/600/300', landing_page: 'https://example.com/3' },
  { id: 4, title: 'Slide 4', image: 'https://picsum.photos/id/1019/600/300', landing_page: 'https://example.com/4' },
  { id: 5, title: 'Slide 5', image: 'https://picsum.photos/id/1020/600/300', landing_page: 'https://example.com/5' },
  { id: 6, title: 'Slide 6', image: 'https://picsum.photos/id/1021/600/300', landing_page: 'https://example.com/6' },
];

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Interactive Carousel Component</h1>
        <p>Drag or swipe to interact. Click on a slide to open its link.</p>
      </header>
      
      <main>
        {/* Requirement: Viewport size 750px * 300px, Card Size 300x300. Max cards visible 2.5 */}
        <Carousel items={mockData} cardWidth={300} autoPlayInterval={3000} />
      </main>
    </div>
  );
}

export default App;
