export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  content: string;
  date: string;
  isVerified: boolean;
  variantName?: string;
}

export const reviews: Review[] = [
  { id: "r1", productId: "1", author: "Sarah M.", rating: 5, content: "Absolutely love this serum! My skin has never looked better. The glow is real and it absorbs so quickly.", date: "2025-12-15", isVerified: true },
  { id: "r2", productId: "1", author: "Emily R.", rating: 4, content: "Great product, noticed a difference in my skin tone within two weeks. Only wish the bottle was a bit larger.", date: "2025-11-28", isVerified: true },
  { id: "r3", productId: "1", author: "Jessica K.", rating: 5, content: "Holy grail serum! I've tried so many vitamin C serums and this one is by far the best. No irritation, just results.", date: "2025-10-10", isVerified: true },
  { id: "r4", productId: "1", author: "Lauren T.", rating: 4, content: "Really nice texture and smell. Brightened my complexion noticeably. Will repurchase.", date: "2025-09-22", isVerified: false },
  { id: "r5", productId: "2", author: "Mia P.", rating: 5, content: "Best matte lipstick I've ever owned. Stays on all day without drying out my lips. The shade is perfect.", date: "2025-12-20", isVerified: true },
  { id: "r6", productId: "2", author: "Olivia D.", rating: 4, content: "Beautiful color and feels comfortable on the lips. Lasts through coffee and lunch!", date: "2025-12-01", isVerified: true },
  { id: "r7", productId: "2", author: "Sophia L.", rating: 5, content: "The formula is incredible — creamy but sets to a true matte. Love how lightweight it feels.", date: "2025-11-15", isVerified: true },
  { id: "r8", productId: "3", author: "Chloe W.", rating: 5, content: "My damaged hair feels like silk again. Used it twice and already see a huge difference. Smells divine!", date: "2025-12-18", isVerified: true },
  { id: "r9", productId: "3", author: "Amelia B.", rating: 4, content: "Great deep conditioner. Leaves my hair soft and frizz-free. A little goes a long way.", date: "2025-11-30", isVerified: true },
  { id: "r10", productId: "3", author: "Isabella N.", rating: 5, content: "This mask saved my bleached hair! It's now soft, shiny, and healthy again. Highly recommend.", date: "2025-10-25", isVerified: true },
  { id: "r11", productId: "4", author: "Grace H.", rating: 5, content: "The most beautiful floral scent! I get compliments everywhere I go. Long-lasting and elegant.", date: "2025-12-22", isVerified: true },
  { id: "r12", productId: "4", author: "Lily F.", rating: 5, content: "Bloom is my new signature scent. It's feminine without being overpowering. Love the vanilla undertones.", date: "2025-12-05", isVerified: true },
  { id: "r13", productId: "4", author: "Zoe C.", rating: 4, content: "Beautiful fragrance but doesn't last as long as I'd hoped on my skin. Still lovely though.", date: "2025-11-10", isVerified: true },
  { id: "r14", productId: "5", author: "Aria G.", rating: 5, content: "My morning ritual! This jade roller depuffs my eyes instantly. Feels so cooling and relaxing.", date: "2025-12-19", isVerified: true },
  { id: "r15", productId: "5", author: "Ella M.", rating: 4, content: "Great quality roller for the price. Smooth rolling and feels nice on the skin. Storage pouch included.", date: "2025-11-25", isVerified: true },
  { id: "r16", productId: "6", author: "Harper S.", rating: 5, content: "Perfect daily moisturizer with SPF. Lightweight but very hydrating. No white cast at all.", date: "2025-12-16", isVerified: true },
  { id: "r17", productId: "6", author: "Avery R.", rating: 4, content: "Lovely cream that absorbs quickly. Great under makeup. Would love a larger size option.", date: "2025-11-20", isVerified: true },
  { id: "r18", productId: "7", author: "Scarlett K.", rating: 4, content: "Gives a beautiful natural glow. Medium coverage that's buildable. Shade match was perfect.", date: "2025-12-14", isVerified: true },
  { id: "r19", productId: "7", author: "Victoria W.", rating: 5, content: "Finally a foundation that looks like skin! Dewy finish without being greasy. Love it.", date: "2025-11-08", isVerified: true },
  { id: "r20", productId: "8", author: "Penelope A.", rating: 5, content: "This argan oil is amazing. Tames my frizz without making hair greasy. A few drops is all you need.", date: "2025-12-21", isVerified: true },
  { id: "r21", productId: "8", author: "Riley J.", rating: 4, content: "Makes my hair so shiny and soft! The scent is lovely too. Great value for the price.", date: "2025-12-02", isVerified: true },
  { id: "r22", productId: "9", author: "Hannah L.", rating: 5, content: "Incredibly concentrated and long-lasting. One drop lasts all day. The rose scent is divine.", date: "2025-12-17", isVerified: true },
  { id: "r23", productId: "9", author: "Layla B.", rating: 5, content: "Perfect for evening wear. Warm and sensual scent that gets noticed. Worth every penny.", date: "2025-11-12", isVerified: true },
  { id: "r24", productId: "10", author: "Stella C.", rating: 4, content: "Gentle yet effective. My skin feels so clean after using this. Battery lasts a long time too.", date: "2025-12-13", isVerified: true },
  { id: "r25", productId: "10", author: "Nora P.", rating: 4, content: "Great cleansing brush. Silicone bristles are very gentle. Removes makeup thoroughly.", date: "2025-10-30", isVerified: true },
  { id: "r26", productId: "11", author: "Mila T.", rating: 5, content: "My fine lines are visibly reduced after a month of use. Strong but gentle formulation.", date: "2025-12-23", isVerified: true },
  { id: "r27", productId: "11", author: "Evelyn G.", rating: 5, content: "Game changer for my skin! Smooth, plump, and glowing. The retinol is potent but not irritating.", date: "2025-12-08", isVerified: true },
  { id: "r28", productId: "12", author: "Abigail S.", rating: 5, content: "Gorgeous palette with amazing pigmentation. The shimmers are stunning and the mattes blend like a dream.", date: "2025-12-24", isVerified: true },
  { id: "r29", productId: "12", author: "Charlotte D.", rating: 5, content: "Perfect sunset shades! So versatile for day and night looks. Best palette I own.", date: "2025-12-10", isVerified: true },
  { id: "r30", productId: "12", author: "Aria K.", rating: 4, content: "Beautiful colors though some shades have a bit of fallout. The warm tones are stunning though.", date: "2025-11-18", isVerified: true },
  { id: "r31", productId: "1", author: "Tanya R.", rating: 2, content: "Caused breakouts on my sensitive skin. Really wanted to love it but my face did not agree.", date: "2025-12-05", isVerified: true },
  { id: "r32", productId: "2", author: "Rachel K.", rating: 1, content: "The shade looked nothing like the photo. Way too orange for my complexion. Returning.", date: "2025-12-12", isVerified: true },
  { id: "r33", productId: "2", author: "Diana P.", rating: 2, content: "Dries out my lips after a few hours. Not as moisturizing as advertised.", date: "2025-11-08", isVerified: false },
  { id: "r34", productId: "4", author: "Nicole H.", rating: 3, content: "Nice scent but fades too quickly for the price. Wish it had better longevity.", date: "2025-12-09", isVerified: true },
  { id: "r35", productId: "4", author: "Valerie S.", rating: 2, content: "Smells nice in the bottle but turns sour on my skin. Might be my body chemistry.", date: "2025-10-15", isVerified: false },
  { id: "r36", productId: "7", author: "Maria F.", rating: 3, content: "Decent foundation but the shade range is limiting. The formula oxidizes slightly.", date: "2025-12-20", isVerified: true },
  { id: "r37", productId: "7", author: "Jade W.", rating: 1, content: "Made me look cakey and settled into fine lines. Not for mature skin at all.", date: "2025-11-03", isVerified: true },
  { id: "r38", productId: "12", author: "Katherine L.", rating: 3, content: "Pretty colors but a lot of fallout. Need to tap off excess before applying.", date: "2025-12-11", isVerified: true },
  { id: "r39", productId: "12", author: "Samantha D.", rating: 2, content: "The shimmers are gorgeous but the mattes are chalky and hard to blend.", date: "2025-11-22", isVerified: false },
  { id: "r40", productId: "3", author: "Brianna C.", rating: 2, content: "Too heavy for my fine hair. Left it greasy even after thorough rinsing.", date: "2025-11-14", isVerified: true },
];

export function getReviewsByProductId(productId: string): Review[] {
  return reviews.filter((r) => r.productId === productId);
}
