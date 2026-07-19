import React from 'react';
import {Composition} from 'remotion';
import {PromoTile, StoreScreenshot} from './store-assets';

const locales = ['en', 'he'] as const;
const slides = [1, 2, 3, 4, 5] as const;

export const StoreAssetsRoot: React.FC = () => (
  <>
    {locales.flatMap((locale) =>
      slides.map((slide) => (
        <Composition
          key={`${locale}-${slide}`}
          id={`Store-${locale.toUpperCase()}-${String(slide).padStart(2, '0')}`}
          component={StoreScreenshot}
          durationInFrames={1}
          fps={30}
          width={1280}
          height={800}
          defaultProps={{locale, slide}}
        />
      )),
    )}
    <Composition
      id="Promo-Small"
      component={PromoTile}
      durationInFrames={1}
      fps={30}
      width={440}
      height={280}
      defaultProps={{wide: false}}
    />
    <Composition
      id="Promo-Marquee"
      component={PromoTile}
      durationInFrames={1}
      fps={30}
      width={1400}
      height={560}
      defaultProps={{wide: true}}
    />
  </>
);
