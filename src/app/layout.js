import './globals.css';

export const metadata = {
  title: 'Sword-Vocab 复习系统',
  description: '艾宾浩斯记忆曲线驱动的英语单词复习系统',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
