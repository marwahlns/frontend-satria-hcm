// pages/index.tsx
import React from 'react';
import Head from 'next/head'; // Untuk mengatur head HTML, SEO
import Image from 'next/image'; // Jika ingin menambahkan logo atau gambar

export default function Home() {
  return (
    <>
      <Head>
        <title>Selamat Datang di SATRIA HCM</title>
        <meta name="description" content="Dashboard Sistem Manajemen Sumber Daya Manusia SATRIA HCM" />
        {/* Anda bisa menambahkan favicon, meta tags lainnya di sini */}
      </Head>

      <div style={styles.container}>
        <header style={styles.header}>
          {/* Anda bisa menambahkan logo di sini */}
          {/* <Image
            src="/path/to/your/logo.png" // Ganti dengan path logo Anda
            alt="SATRIA HCM Logo"
            width={150}
            height={50}
            style={styles.logo}
          /> */}
          <h1 style={styles.appTitle}>SATRIA HCM</h1>
        </header>

        <main style={styles.mainContent}>
          <h2 style={styles.welcomeHeading}>Selamat Datang di Portal Karyawan Anda!</h2>
          <p style={styles.welcomeText}>
            Kelola data presensi, pengajuan cuti, dan informasi personal Anda dengan mudah di sini.
            SATRIA HCM hadir untuk membantu Anda dan perusahaan dalam mengoptimalkan pengelolaan Sumber Daya Manusia.
          </p>

          <div style={styles.featuresSection}>
            <div style={styles.featureCard}>
              <h3>Presensi</h3>
              <p>Lihat riwayat presensi harian dan bulanan Anda.</p>
            </div>
            <div style={styles.featureCard}>
              <h3>Pengajuan</h3>
              <p>Ajukan cuti, izin, atau perjalanan dinas dengan cepat.</p>
            </div>
            <div style={styles.featureCard}>
              <h3>Profil</h3>
              <p>Perbarui informasi pribadi dan kontak Anda.</p>
            </div>
          </div>

          <p style={styles.callToAction}>
            Jelajahi fitur-fitur kami sekarang!
          </p>
        </main>

        <footer style={styles.footer}>
          <p>&copy; {new Date().getFullYear()} SATRIA HCM. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}

// Styling (Contoh sederhana, Anda bisa gunakan Tailwind CSS atau modul CSS)
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f4f7f6',
    color: '#333',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
    padding: '20px',
    width: '100%',
    maxWidth: '800px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  logo: {
    marginBottom: '10px',
  },
  appTitle: {
    fontSize: '2.5em',
    color: '#0056b3', // Warna branding Anda
    margin: '0',
  },
  mainContent: {
    textAlign: 'center',
    width: '100%',
    maxWidth: '800px',
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  welcomeHeading: {
    fontSize: '2em',
    color: '#333',
    marginBottom: '15px',
  },
  welcomeText: {
    fontSize: '1.1em',
    lineHeight: '1.6',
    marginBottom: '30px',
  },
  featuresSection: {
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: '20px',
    marginBottom: '30px',
  },
  featureCard: {
    backgroundColor: '#e6f7ff', // Warna latar belakang kartu fitur
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    flex: '1',
    minWidth: '200px',
    maxWidth: '30%',
    textAlign: 'left',
  },
  callToAction: {
    fontSize: '1.2em',
    fontWeight: 'bold',
    color: '#0056b3',
  },
  footer: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '0.9em',
    color: '#777',
    width: '100%',
    maxWidth: '800px',
  },
};