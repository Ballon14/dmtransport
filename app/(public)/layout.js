import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import WhatsAppButton from "../components/WhatsAppButton";
import LiveChatWidget from "../components/LiveChatWidget";

export default function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '80px' }}>
        {children}
      </main>
      <Footer />
      <LiveChatWidget />
      <WhatsAppButton />
    </>
  );
}
