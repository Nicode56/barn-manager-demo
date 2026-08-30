import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import "../styles/corkboard.css";


export const DemoHome: React.FC = () => {
  const { message, highlights, boardNotes } = useSelector(
    (state: RootState) => state.demo,
  );

  return (
    <div className="demo-home">
      <section className="hero-panel">
        <h1 className="hero-title">Barn Management Demo</h1>
        <p className="hero-subtitle">{message}</p>

        <div className="highlight-grid">
          {highlights.map((item, index) => (
            <div key={index} className="highlight-card">
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="role-grid">
          <Link to="/demo/manager" className="role-card">
            Manager Demo
          </Link>
          <Link to="/demo/staff" className="role-card">
            Staff Demo
          </Link>
          <Link to="/demo/client" className="role-card">
            Client Demo
          </Link>
        </div>
      </section>

     <h2 className="section-title">Farm Bulletin Board</h2>

<div
  className="bulletin-cork"
>
  <div className="flex flex-wrap justify-center gap-10">
    {boardNotes.map((note, index) => {
      const content = (
        <>
          <div className="pin"></div>

          <strong className="font-semibold text-slate-800 mb-2 text-lg block">
            {note.title}
          </strong>

          <p className="text-slate-700 text-sm leading-relaxed">
            {note.description}
          </p>
        </>
      );

      return note.link ? (
        <Link key={index} to={note.link} className="bulletin-note">
          {content}
        </Link>
      ) : (
        <div key={index} className="bulletin-note">
          {content}
        </div>
      );
    })}
  </div>
</div>

      <section className="farm-info-section">
        <h2 className="section-title">Farm Info</h2>
        <div className="farm-info-panel">
          <div className="farm-info-card">
            <p className="farm-info-label">Farm Hours</p>
            <p className="farm-info-value">Monday – Sunday · 7:00 AM – 7:00 PM</p>
          </div>
          <div className="farm-info-card">
            <p className="farm-info-label">Address</p>
            <p className="farm-info-value">123 Maple Ridge Farm, Pleasant Grove, CA</p>
          </div>
        </div>
      </section>

    </div>
  );
};
