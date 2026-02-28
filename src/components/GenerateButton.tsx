import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  isGenerating?: boolean;
}

const GenerateButton: React.FC<ButtonProps> = ({ onClick, disabled, isGenerating }) => {
  return (
    <StyledWrapper $isGenerating={isGenerating}>
      <div className="btn-wrapper">
        <button 
          className="btn" 
          onClick={onClick} 
          disabled={disabled || isGenerating}
          type="button"
        >
          <svg className="btn-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
          <div className="txt-wrapper">
            <div className="txt-1">
              <span className="btn-letter">G</span>
              <span className="btn-letter">e</span>
              <span className="btn-letter">n</span>
              <span className="btn-letter">e</span>
              <span className="btn-letter">r</span>
              <span className="btn-letter">a</span>
              <span className="btn-letter">t</span>
              <span className="btn-letter">e</span>
            </div>
            <div className="txt-2">
              <span className="btn-letter">G</span>
              <span className="btn-letter">e</span>
              <span className="btn-letter">n</span>
              <span className="btn-letter">e</span>
              <span className="btn-letter">r</span>
              <span className="btn-letter">a</span>
              <span className="btn-letter">t</span>
              <span className="btn-letter">i</span>
              <span className="btn-letter">n</span>
              <span className="btn-letter">g</span>
            </div>
          </div>
        </button>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div<{ $isGenerating?: boolean }>`
  .btn-wrapper {
    position: relative;
    display: inline-block;
  }

  .btn {
    --border-radius: 20px;
    --padding: 3px;
    --transition: 0.4s;
    --button-color: #161C2C; /* Matches chat input */
    --highlight-color-hue: 210deg;

    user-select: none;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0.5em 0.8em 0.5em 1em;
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;

    background-color: var(--button-color);

    box-shadow:
      inset 0px 1px 1px rgba(255, 255, 255, 0.1),
      0px 4px 10px rgba(0, 0, 0, 0.3);

    border: solid 1px #fff1;
    border-radius: var(--border-radius);
    cursor: pointer;
    color: white;

    transition:
      box-shadow var(--transition),
      border var(--transition),
      background-color var(--transition),
      opacity 0.2s;

    &:disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }
  }

  .btn::before {
    content: "";
    position: absolute;
    top: calc(0px - var(--padding));
    left: calc(0px - var(--padding));
    width: calc(100% + var(--padding) * 2);
    height: calc(100% + var(--padding) * 2);
    border-radius: calc(var(--border-radius) + var(--padding));
    pointer-events: none;
    background-image: linear-gradient(0deg, #0004, #000a);

    z-index: -1;
    transition:
      box-shadow var(--transition),
      filter var(--transition);
    box-shadow:
      0 -4px 8px -6px #0000 inset,
      1px 1px 1px #fff1,
      -1px -1px 1px #0002;
  }

  .btn::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    pointer-events: none;
    background-image: linear-gradient(
      0deg,
      #fff,
      hsl(var(--highlight-color-hue), 100%, 70%),
      hsla(var(--highlight-color-hue), 100%, 70%, 50%),
      8%,
      transparent
    );
    background-position: 0 0;
    opacity: 0;
    transition:
      opacity var(--transition),
      filter var(--transition);
  }

  .btn-letter {
    position: relative;
    display: inline-block;
    color: #fff8;
    animation: letter-anim 2s ease-in-out infinite;
    transition:
      color var(--transition),
      text-shadow var(--transition),
      opacity var(--transition);
  }

  @keyframes letter-anim {
    50% {
      text-shadow: 0 0 3px #fff8;
      color: #fff;
    }
  }

  .btn-svg {
    height: 18px;
    width: 18px;
    margin-right: 0.5rem;
    fill: #e8e8e8;
    animation: flicker 2s linear infinite;
    animation-delay: 0.5s;
    filter: drop-shadow(0 0 2px #fff9);
    transition:
      fill var(--transition),
      filter var(--transition),
      opacity var(--transition);
  }

  @keyframes flicker {
    50% {
      opacity: 0.5;
    }
  }

  .txt-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    min-width: 5.5em;
  }

  .txt-1,
  .txt-2 {
    position: absolute;
    left: 0;
    transition: opacity 0.3s ease-in-out;
  }

  .txt-1 {
    opacity: ${props => props.$isGenerating ? 0 : 1};
  }

  .txt-2 {
    opacity: ${props => props.$isGenerating ? 1 : 0};
  }

  .btn:hover {
    border: solid 1px hsla(var(--highlight-color-hue), 100%, 80%, 40%);
    background-color: #1e2538;
  }

  .btn:hover::after {
    opacity: 0.3;
  }

  .btn:hover .btn-svg {
    fill: #fff;
    filter: drop-shadow(0 0 3px hsl(var(--highlight-color-hue), 100%, 70%));
  }

  .btn:active {
    transform: scale(0.98);
  }

  /* Letter animation delays */
  .btn-letter:nth-child(1) { animation-delay: 0s; }
  .btn-letter:nth-child(2) { animation-delay: 0.08s; }
  .btn-letter:nth-child(3) { animation-delay: 0.16s; }
  .btn-letter:nth-child(4) { animation-delay: 0.24s; }
  .btn-letter:nth-child(5) { animation-delay: 0.32s; }
  .btn-letter:nth-child(6) { animation-delay: 0.4s; }
  .btn-letter:nth-child(7) { animation-delay: 0.48s; }
  .btn-letter:nth-child(8) { animation-delay: 0.56s; }
  .btn-letter:nth-child(9) { animation-delay: 0.64s; }
  .btn-letter:nth-child(10) { animation-delay: 0.72s; }
`;

export default GenerateButton;