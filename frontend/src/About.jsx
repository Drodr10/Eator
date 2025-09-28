const About = () => {
  const gradientBackground = {
    background: 'linear-gradient(to right, #ff7e5f, #feb47b)',
    padding: '40px',
    borderRadius: '10px',
  };

  return (
    <div className="page-container" style={{ padding: '40px' }}>
      <div style={gradientBackground}>
        <h2 style={{ color: '#003366' }}>About Eator</h2>
        <p>
          <strong style={{ color: '#003366' }}>Eator</strong> is a real-time, community-driven application designed to combat food waste and address student food insecurity on the University of Florida campus.
        </p>
        <p>
          Our mission is simple: connect leftover food from campus events with students who need or want it. Student organizations can easily drop a pin on our map to advertise their surplus food, preventing it from going to waste and gaining publicity for their club. In turn, students can find free, accessible meals right on campus.
        </p>
        <p>
          This project was built in 24 hours for the UF Open Source Club's Minihack.
        </p>
      </div>
    </div>
  );
};

export default About;