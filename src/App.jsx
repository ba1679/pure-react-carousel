import Carousel from './Carousel';
import img1 from './assets/images/img_1.webp';
import img2 from './assets/images/img_2.webp';
import img3 from './assets/images/img_3.webp';
import img4 from './assets/images/img_4.webp';
import img5 from './assets/images/img_5.webp';

import styles from './index.module.css';

export default function App() {
  const caroselItems = [
    {
      img: img1,
      title: 'TITLE 1',
      description: 'paragraph 1',
    },
    {
      img: img2,
      title: 'TITLE 2',
      description: 'paragraph 2',
    },
    {
      img: img3,
      title: 'TITLE 3',
      description: 'paragraph 3',
    },
    {
      img: img4,
      title: 'TITLE 4',
      description: 'paragraph 4',
    },
    {
      img: img5,
      title: 'TITLE 5',
      description: 'paragraph 5',
    },
  ];
  return (
    <Carousel>
      {caroselItems.map((item, index) => (
        <div
          className={styles.caroselItems}
          key={`slides-${index}`}
          style={{
            backgroundImage: `url(${item.img})`,
          }}>
          <div className={styles.slideContent}>
            <h2 className={styles.title}>{item.title}</h2>
            <p className={styles.description}>{item.description}</p>
          </div>
        </div>
      ))}
    </Carousel>
  );
}
