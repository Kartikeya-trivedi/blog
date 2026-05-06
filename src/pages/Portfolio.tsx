import { motion } from 'motion/react';
import { Circle, Square, Layout, PenTool, Image as LucideImage, Type } from 'lucide-react';

const projects = [
  {
    id: 1,
    title: 'Monolith Aesthetics',
    desc: 'A structural exploration of Brutalist form.',
    year: '2023',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUYHC1SrPljbGoNBL5_HtyYIJe1-CQLdduLtx3xhoCGE5QN5_k-7NeOo3_Al8axef96SOGiO_Zlg0Lm0JwP5HPR7FkVEvAv03uu9mINAtv87icGI3pW3BkM60UZmwQ_-JACuj1j0g4wF1v_tZGGA4VAwIqG9QN_KS9uf4-WDpcb698p16P5ljTsCg178xSJU_LBxvu1IHvP-2ei3hb1iSAUvSWzrhlP_bNYG9vxnZFfgE4QE8QI9wSrq1RGnHS0kNZTU5y2s9xPXI',
    cols: 'col-span-12 md:col-span-8'
  },
  {
    id: 2,
    title: 'The Paper Journal',
    desc: 'Editorial layout and identity.',
    year: '2023',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjfQxAOouW_zKXjDsgjY2vx2TkLFqWf3-y8oW2-yuKR-EYKRZ8qxnIAFaQdXn7_mbr-vJD92ZfzeJp0t37OpDr6zgDwyjxlq7hhYQXX2M3JX4TK4lcYdHFfQ57MCZMyEMJGlcOUAWLzOK3A5T1XdKqqS8gqE7MaOqPHwScOZhZy10gU7sOUQvoY_NjnzBPPhbLNsCdsoQcrT9bVoMpSv56akRjsid1MbbeSlzjnlOKPrUWLf_RAxuHztSwOqjj2KUm8lhRbCTU9Zo',
    cols: 'col-span-12 md:col-span-4 mt-0 md:mt-24'
  },
  {
    id: 3,
    title: 'Vessel Studies',
    desc: 'Product photography and direction.',
    year: '2022',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAe-qbtBCX-UrRmpAoBzzrNmWbq7FsKGHqjiaWOhWUbv2LJhkiEB8E0HtmFg42uS4-qMYbN-lneKkMsnbCAxD_ZPNWepN7729zNJCCSxZ6Qpwi9MiooVyeBXRhKOBb4XDRFDY1kAvAQqOGKlyso6B-iu_Xef7NN1mjo23yXY21_U0E7XnwjRlCJlOMZNLTKYv93MlQkWnmocOK3M9xg5vaeIeDxyKLb8g-0-YPzn1cdYkcTd5bVn1xeQ_W_TTa3yhbDyxX582iR3-w',
    cols: 'col-span-12 md:col-span-4'
  },
  {
    id: 4,
    title: 'Gallery Curations',
    desc: 'Digital exhibition space design.',
    year: '2024',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDA6-AuipVDY5tegIy8-VYNonhStDPPkS0Cq4pCE1A-j67b53j4dEmCu4TA-1rfp7ED8iazZossX5yRFKhsWDe6MQeaZp1_a3thGinq3GfrN0MbB9YR-9HgHABtin5TRa1hqAre-CHuMaUrW-8k4y4H1Ygntr3Zs1yM9EPTca83guGeIEQnn_akpveggY6yVpJo97X7cW9_uPtpKvZjhcw-m2TUtgQwwPzNGXPctPV6bHp2kywaSVSK1gA6QsQdwStwtLmlxNJvzGw',
    cols: 'col-span-12 md:col-span-8'
  }
];

export default function PortfolioPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-container-max mx-auto px-margin-page"
    >
      {/* Hero Section */}
      <section className="mt-24 mb-section-gap grid grid-cols-12 gap-8 items-end">
        <div className="col-span-12 lg:col-span-7">
          <span className="text-label-caps text-secondary block mb-6">CURATOR & DESIGNER</span>
          <h1 className="text-display leading-tight mb-8">
            Crafting narratives through <span className="italic text-secondary">visual discipline</span> and intellectual rigor.
          </h1>
          <p className="text-body-lg text-secondary max-w-xl">
            I am a creative director and independent publisher focused on the intersection of modern minimalism and classical editorial design. The Editorial is my digital monograph—a space dedicated to high-fidelity exploration and the quiet authority of well-considered content.
          </p>
        </div>
        <div className="col-span-12 lg:col-span-5 aspect-[4/5] bg-surface-container overflow-hidden">
          <img 
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover grayscale" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYT7hoH1AboLqmPVvuv3t8ZJwOnr5Di0K3NeBdrsNvQVQ_K20q5TR5oKuIKx-H2uwEeWTb5eq8_fQfpPFbZp7QlGEgReT7y1lq9I-bWYKEpMzBG6dWLNGjDmWIADDEICL3gJ4HcFo3NKzkvXOIyR_TBTQk_qbfLtY7qBYs1pskUHpq60uL6Daw_v5qwFkIkyPjHOuHsED5G3sY0r7y1ppR20kVOeFrXZz9jdgOo6CqOdOk8qJAfBJ05SpJPJzkeDIm1nak15nz96s" 
          />
        </div>
      </section>

      {/* Selected Works */}
      <section className="mb-section-gap">
        <div className="flex justify-between items-end border-b border-outline-variant pb-4 mb-12">
          <h2 className="text-headline-md">Selected Works</h2>
          <span className="text-label-caps text-secondary">VOLUME 01—04</span>
        </div>
        <div className="grid grid-cols-12 gap-8">
          {projects.map((project) => (
            <motion.div 
              key={project.id} 
              className={`${project.cols} group cursor-pointer`}
              whileHover={{ y: -10 }}
            >
              <div className="aspect-[16/9] md:aspect-auto overflow-hidden bg-surface-container-low border border-outline-variant mb-6">
                <img 
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  src={project.image} 
                  alt={project.title}
                />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-headline-sm mb-2 group-hover:italic transition-all">{project.title}</h3>
                  <p className="text-secondary text-body-md">{project.desc}</p>
                </div>
                <span className="text-label-caps pt-2">{project.year}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Expertise */}
      <section className="mb-section-gap">
        <div className="grid grid-cols-12 gap-8 border-t border-tertiary pt-16">
          <div className="col-span-12 lg:col-span-4">
            <h2 className="text-headline-lg leading-tight font-serif italic">The <br/>Expertise</h2>
          </div>
          <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-y-16 gap-x-8">
            <div className="border-l border-outline-variant pl-8">
              <h4 className="text-label-caps text-secondary mb-6">DESIGN DISCIPLINE</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3"><Layout size={14} /><span className="text-body-md">Editorial Layout Design</span></li>
                <li className="flex items-center gap-3"><PenTool size={14} /><span className="text-body-md">Minimalist Branding</span></li>
                <li className="flex items-center gap-3"><LucideImage size={14} /><span className="text-body-md">Visual Storytelling</span></li>
                <li className="flex items-center gap-3"><Type size={14} /><span className="text-body-md">Typeface Selection</span></li>
              </ul>
            </div>
            <div className="border-l border-outline-variant pl-8">
              <h4 className="text-label-caps text-secondary mb-6">CURATION & CONTENT</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3"><Square size={12} fill="black"/><span className="text-body-md">Creative Direction</span></li>
                <li className="flex items-center gap-3"><Square size={12} fill="black"/><span className="text-body-md">Exhibition Design</span></li>
                <li className="flex items-center gap-3"><Square size={12} fill="black"/><span className="text-body-md">Copy Editing</span></li>
                <li className="flex items-center gap-3"><Square size={12} fill="black"/><span className="text-body-md">Digital Publishing</span></li>
              </ul>
            </div>
            
            <div className="col-span-12 border-t border-outline-variant pt-16 mt-8">
              <h4 className="text-label-caps text-secondary mb-8">HISTORY</h4>
              <div className="space-y-8">
                <HistoryItem title="Lead Creative, Studio Minimal" date="2020 — PRESENT" />
                <HistoryItem title="Editorial Designer, Print Matters" date="2018 — 2020" />
                <HistoryItem title="Junior Art Director, Agency X" date="2015 — 2018" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mb-section-gap py-32 bg-secondary text-white text-center">
        <h2 className="text-display italic mb-12">Let's collaborate.</h2>
        <div className="flex justify-center gap-8">
          <a href="mailto:hello@theeditorial.com" className="border-b border-white pb-2 text-label-caps hover:opacity-70 transition-opacity">hello@theeditorial.com</a>
          <a href="#" className="border-b border-white pb-2 text-label-caps hover:opacity-70 transition-opacity">INSTAGRAM</a>
        </div>
      </section>
    </motion.div>
  );
}

function HistoryItem({ title, date }: { title: string, date: string }) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-baseline gap-4 border-b border-outline-variant pb-8 last:border-0 last:pb-0">
      <div className="text-headline-sm">{title}</div>
      <div className="text-secondary text-label-caps">{date}</div>
    </div>
  );
}
