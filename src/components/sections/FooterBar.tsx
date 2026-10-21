import React from "react";

export function FooterBar() {
  return (
    <footer className="lunoris-footer">
      <div className="lunoris-wide-wrap lunoris-footer-inner">
        <img
          src="/assets/logo-wordmark.svg"
          alt="Lunoris: Piece of Mind"
          className="lunoris-footer-logo"
        />
        <p className="lunoris-footer-legal">
          Lunoris and the Lunoris logo are trademarks and/or registered
          trademarks. 2026 Lunoris: Piece of Mind, all rights reserved.
        </p>
      </div>
    </footer>
  );
}
