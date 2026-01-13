import { SignIn } from "@clerk/nextjs";

export const metadata = {
  title: "Masuk | DM Transport Purworejo",
};

export default function SignInPage() {
  return (
    <div style={styles.container}>
      <SignIn 
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
