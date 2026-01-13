import { SignUp } from "@clerk/nextjs";

export const metadata = {
  title: "Daftar | DM Transport Purworejo",
};

export default function SignUpPage() {
  return (
    <div style={styles.container}>
      <SignUp 
        appearance={{
          elements: {
            rootBox: {
              margin: '0 auto',
            },
            card: {
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
              borderRadius: '1rem',
            },
          },
        }}
      />
    </div>
  );
}

const styles = {
  container: {
    minHeight: 'calc(100vh - 80px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: '#f8fafc',
  },
};
