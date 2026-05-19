import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";

export default function Home() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const icons = useRef([]);
  const stars = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Fewer icons for better visual balance
    const iconList = ["🎓", "📚", "📝", "📖", "✏️"];
    const numIcons = iconList.length;
    const baseSpeed = 1.2; // slower falling speed

    // Initialize falling icons
    for (let i = 0; i < numIcons; i++) {
      icons.current.push({
        icon: iconList[i],
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        speed: baseSpeed,
        alpha: 1.0 // increased opacity for better visibility
      });
    }

    // Initialize stars
    const numStars = 80;
    for (let i = 0; i < numStars; i++) {
      stars.current.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        alpha: Math.random()
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      stars.current.forEach(star => {
        ctx.fillStyle = `rgba(255,255,255,${star.alpha})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        // Twinkle effect
        star.alpha += (Math.random() - 0.5) * 0.02;
        if (star.alpha < 0) star.alpha = 0;
        if (star.alpha > 1) star.alpha = 1;
      });

      // Draw falling icons
      icons.current.forEach(icon => {
        ctx.globalAlpha = icon.alpha;
        ctx.font = "2rem serif";
        ctx.fillText(icon.icon, icon.x, icon.y);

        icon.y += icon.speed;
        if (icon.y > canvas.height + 50) {
          icon.y = -50; // reset to top
          icon.x = Math.random() * canvas.width;
        }
      });

      ctx.globalAlpha = 1;
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="home-container position-relative min-vh-100 vw-100 d-flex flex-column justify-content-center align-items-center bg-dark text-light text-center px-3 m-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />

      {/* Main content */}
      <div className="content z-1">
        <h1 className="display-3 fw-bold mb-3 z-1">StudentHub</h1>
        <p className="lead mb-2 z-1">
          Your all-in-one platform to connect, learn, and share resources with students worldwide 🌍
        </p>
        <p className="mb-4 text-secondary z-1" style={{ maxWidth: "600px" }}>
          Empowering students to take charge of their learning, collaborate with peers, 
          and contribute responsibly to the global student community.
        </p>

        <div className="d-flex gap-3 z-1">
          <button className="btn btn-primary btn-lg px-4" onClick={() => navigate("/signup")}>Signup</button>
          <button className="btn btn-outline-light btn-lg px-4" onClick={() => navigate("/login")}>Login</button>
        </div>
      </div>
    </div>
  );
}
