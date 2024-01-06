import Carousel from './Carousel';
import img1 from './assets/images/img_1.webp';
import img2 from './assets/images/img_2.webp';
import img3 from './assets/images/img_3.webp';
import img4 from './assets/images/img_4.webp';
import img5 from './assets/images/img_5.webp';

import styles from './index.module.css';

export default function App() {
  const caroselImgs = [img1, img2, img3, img4, img5];
  return (
    <Carousel arrow autoPlay>
      {caroselImgs.map((img, index) => (
        <div
          className={styles.caroselItems}
          key={`slides-${index}`}
          style={{
            backgroundImage: `url(${img})`,
          }}>
          <div className={styles.slideContent}>
            <h2 className={styles.title}>{`我是湯圓 - ${index + 1}`}</h2>
            <p className={styles.description}>{`湯圓好可愛 - ${index + 1}`}</p>
          </div>
        </div>
      ))}
    </Carousel>
  );
}
