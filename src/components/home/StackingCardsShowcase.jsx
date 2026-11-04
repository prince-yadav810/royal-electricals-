'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import styles from './StackingCardsShowcase.module.css';
import { createConcaveRenderer } from './concaveRenderer';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const products = [
    {
      id: 1,
      title: 'Power & Hand Tools',
      image: '/images/Products_preview/PowerTools&HandTools.jpg',
      color: 'from-primary-500 to-primary-700',
      link: '/products/hardware/power-hand-tools'
    },
    {
      id: 2,
      title: 'Lugs & Glands',
      image: '/images/Products_preview/Lugs&Glands.jpg',
      color: 'from-secondary-500 to-secondary-700',
      link: '/products/electrical/lugs-glands'
    },
    {
      id: 3,
      title: 'Switchgears',
      image: '/images/Products_preview/Switchgears.jpg',
      color: 'from-primary-500 to-primary-700',
      link: '/products/electrical/switchgears'
    },
    {
      id: 4,
      title: 'Tarpaulin',
      image: '/images/Products_preview/Tarpaulin.jpg',
      color: 'from-secondary-500 to-secondary-700',
      link: '/products/hardware/tarpaulin'
    },
    {
      id: 5,
      title: 'Nuts, Bolts & Fasteners',
      image: '/images/Products_preview/NutsBolts&Fasteners.jpg',
      color: 'from-primary-500 to-primary-700',
      link: '/products/hardware/fasteners'
    },
    {
      id: 6,
      title: 'Waterproofing',
      image: '/images/Products_preview/waterProofing.jpg',
      color: 'from-secondary-500 to-secondary-700',
      link: '/products/construction-chemicals/waterproofing'
    },
    {
      id: 7,
      title: 'Wood Coating',
      image: '/images/Products_preview/woodPainting.jpg',
      color: 'from-primary-400 to-primary-600',
      link: '/products/construction-chemicals/wood-coatings'
    },
    {
      id: 8,
      title: 'TMT Bars',
      image: '/images/Products_preview/TMTBars.jpg',
      color: 'from-secondary-600 to-secondary-800',
      link: '/products/structural-steel/tmt-bars'
    },
    {
      id: 9,
      title: 'Fall Protection',
      image: '/images/Products_preview/FallProtection.jpg',
      color: 'from-primary-600 to-primary-800',
      link: '/products/safety-ppe/fall-protection'
    },
    {
      id: 10,
      title: 'Earth Moving Equipment',
      image: '/images/Products_preview/EarthMovingEquipment.jpg',
      color: 'from-primary-500 to-primary-700',
      link: '/products/construction-equipment/earth-moving'
    },
    {
      id: 11,
      title: 'CPVC Pipes & Fittings',
      image: '/images/Products_preview/CPVCPipes&Fittings.jpg',
      color: 'from-secondary-500 to-secondary-700',
      link: '/products/pipes-fittings/cpvc'
    },
    {
      id: 12,
      title: 'Flanges & Gaskets',
      image: '/images/Products_preview/Flanges&Gaskets.jpg',
      color: 'from-gray-600 to-gray-800',
      link: '/products/pipes-fittings/flanges-gaskets'
    }
  ];

export default function StackingCardsShowcase() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const cardsRef = useRef([]);
  const navigateRef = useRef(() => {});
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const cards = cardsRef.current;
    const media = gsap.matchMedia();
    const select = (index) => {
      const next = Math.max(0, Math.min(products.length - 1, index));
      if (next !== activeRef.current) {
        activeRef.current = next;
        setActive(next);
      }
    };

    media.add({ reduced: '(prefers-reduced-motion: reduce)', animated: '(prefers-reduced-motion: no-preference)' }, (context) => {
      if (context.conditions.reduced) {
        const syncSelection = () => select(Math.round(stage.scrollLeft / (cards[0].offsetWidth + 24)));
        navigateRef.current = (index) => {
          const next = Math.max(0, Math.min(products.length - 1, index));
          stage.scrollTo({ left: next * (cards[0].offsetWidth + 24), behavior: 'instant' });
          select(next);
        };
        stage.addEventListener('scroll', syncSelection, { passive: true });
        return () => stage.removeEventListener('scroll', syncSelection);
      }

      const renderer = createConcaveRenderer(canvasRef.current, products, (ready) => { section.dataset.rendered = String(ready); });
      const playhead = { position: activeRef.current };
      let step = cards[0].offsetWidth + 24;
      const render = () => {
        const camera = cards[0].offsetWidth / 1.25 * 4;
        const radius = camera * 0.72;
        stage.style.perspective = `${camera}px`;
        section.style.setProperty('--gallery-progress', playhead.position / (products.length - 1));
        cards.forEach((card, index) => {
          const offset = index - playhead.position;
          const distance = Math.abs(offset);
          // Side cards come towards the viewer, forming the concave reference arc.
          const angle = offset * step / radius;
          const x = radius * Math.sin(angle);
          const depth = radius * (1 - Math.cos(angle));
          card.style.transform = `translate3d(calc(-50% + ${x}px), -50%, ${depth}px) rotateY(${-angle * 180 / Math.PI}deg)`;
          card.style.visibility = distance > 3 ? 'hidden' : 'visible';
          card.style.setProperty('--caption-opacity', Math.max(0, 1 - distance * 0.68));
          card.style.zIndex = String(10 - Math.round(distance));
        });
        renderer?.draw(playhead.position, cards[0].offsetWidth);
        select(Math.round(playhead.position));
      };
      render();

      const animation = gsap.to(playhead, {
        position: products.length - 1,
        ease: 'none',
        onUpdate: render,
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${(products.length - 1) * Math.max(110, window.innerHeight * 0.18)}`,
          pin: true,
          scrub: 0.3,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: () => { step = cards[0].offsetWidth + 24; render(); },
        },
      });
      const trigger = animation.scrollTrigger;
      navigateRef.current = (index) => {
        const next = Math.max(0, Math.min(products.length - 1, index));
        const top = trigger.start + (trigger.end - trigger.start) * next / (products.length - 1);
        window.scrollTo({ top, behavior: 'smooth' });
      };
      let drag = null;
      let suppressClick = false;
      const pointerDown = (event) => {
        if (event.button !== 0) return;
        drag = { x: event.clientX, y: event.clientY, scroll: window.scrollY, moved: false, pointer: event.pointerId };
        suppressClick = false;
      };
      const pointerMove = (event) => {
        if (!drag) return;
        const dx = event.clientX - drag.x;
        const dy = event.clientY - drag.y;
        if (!drag.moved && Math.abs(dy) > Math.abs(dx)) return;
        if (Math.abs(dx) > 8) {
          drag.moved = true;
          stage.setPointerCapture(event.pointerId);
          const distancePerCard = (trigger.end - trigger.start) / (products.length - 1);
          const top = Math.max(trigger.start, Math.min(trigger.end, drag.scroll - dx / step * distancePerCard));
          window.scrollTo({ top, behavior: 'instant' });
        }
      };
      const pointerUp = () => {
        if (drag?.moved) {
          suppressClick = true;
          const position = trigger.progress * (products.length - 1);
          navigateRef.current(Math.round(position));
        }
        drag = null;
      };
      const pointerCancel = () => { drag = null; };
      const suppressDragClick = (event) => {
        if (suppressClick) { event.preventDefault(); event.stopPropagation(); suppressClick = false; }
      };
      stage.addEventListener('pointerdown', pointerDown);
      stage.addEventListener('pointermove', pointerMove);
      stage.addEventListener('pointerup', pointerUp);
      stage.addEventListener('pointercancel', pointerCancel);
      stage.addEventListener('click', suppressDragClick, true);
      const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
      return () => {
        cancelAnimationFrame(refreshFrame);
        renderer?.destroy();
        stage.style.removeProperty('perspective');
        section.style.removeProperty('--gallery-progress');
        stage.removeEventListener('pointerdown', pointerDown);
        stage.removeEventListener('pointermove', pointerMove);
        stage.removeEventListener('pointerup', pointerUp);
        stage.removeEventListener('pointercancel', pointerCancel);
        stage.removeEventListener('click', suppressDragClick, true);
        cards.forEach((card) => {
          card.style.removeProperty('transform');
          card.style.removeProperty('visibility');
          card.style.removeProperty('z-index');
          card.style.removeProperty('--caption-opacity');
        });
      };
    });

    return () => {
      media.revert();
      navigateRef.current = () => {};
    };
  }, []);

  const navigate = (index) => navigateRef.current(index);
  const handleKeyDown = (event) => {
    const destination = {
      ArrowLeft: activeRef.current - 1,
      ArrowRight: activeRef.current + 1,
      Home: 0,
      End: products.length - 1,
    }[event.key];
    if (destination === undefined) return;
    event.preventDefault();
    navigate(destination);
  };

  return (
    <>
      <section ref={sectionRef} className={styles.showcase} aria-label="Product showcase" aria-roledescription="carousel" onKeyDown={handleKeyDown}>
        <div className={styles.background} aria-hidden="true" />
        <a href="#after-stacking-showcase" className={styles.skip}>Skip product showcase</a>
        <div className={styles.heading}>
          <span className={styles.eyebrow}>THE ROYAL RANGE</span>
          <p>Built for every job.</p>
        </div>

        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        <div ref={stageRef} className={styles.stage}>
          {products.map((product, index) => (
            <article key={product.id} ref={(element) => { cardsRef.current[index] = element; }} className={styles.card} aria-label={`${index + 1} of ${products.length}: ${product.title}`} aria-roledescription="slide">
              <a href={product.link} className={styles.imageLink} tabIndex={active === index ? 0 : -1} aria-label={`View ${product.title}`} onClick={(event) => {
                  if (active !== index) { event.preventDefault(); navigate(index); }
                }}>
                <img src={product.image} alt={product.title} draggable="false" decoding="async" className={styles.image} />
              </a>
              <div className={styles.caption}>
                <h3>{product.title}</h3>
                <a href={product.link} tabIndex={active === index ? 0 : -1}>View products <ArrowRight size={14} aria-hidden="true" /></a>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.bottom}>
          <div className={styles.controls}>
            <button type="button" onClick={() => navigate(activeRef.current - 1)} disabled={active === 0} aria-label="Previous product"><ChevronLeft size={20} /></button>
            <span className={styles.counter} aria-live="polite" aria-atomic="true"><span>{String(active + 1).padStart(2, '0')}</span><span className={styles.total}> / {String(products.length).padStart(2, '0')}</span></span>
            <button type="button" onClick={() => navigate(activeRef.current + 1)} disabled={active === products.length - 1} aria-label="Next product"><ChevronRight size={20} /></button>
          </div>
          <div className={styles.footer}>
            <span className={styles.scrollHint}><ArrowDown size={14} aria-hidden="true" /> Scroll to explore</span>
            <Link href="/products" className={styles.explore}>Explore all products <ArrowRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>
      <div id="after-stacking-showcase" tabIndex={-1} />
    </>
  );
}
