import {
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { useDemoSession } from "../../learning/demoSession";
import type { GameSummary } from "../../types/game";
import "./GameCard.css";

interface GameCardProps {
  game: GameSummary;
  selected: boolean;
  onSelect: (gameId: string) => void;
}

function GameCard({
  game,
  selected,
  onSelect,
}: GameCardProps) {
  const navigate = useNavigate();
  const { role } = useDemoSession();

  const cardRef =
    useRef<HTMLElement | null>(null);

  const popupRef =
    useRef<HTMLDivElement | null>(null);

  const [popupPosition, setPopupPosition] =
    useState({
      top: 0,
      left: 0,
    });

  const coverImageUrl =
    game.coverImageUrl ??
    game.iconUrl;

  const developer =
    game.studioName ??
    game.publisher ??
    "Studio not listed";

  const isDrmFree =
    game.integrationType === "DRM_FREE" ||
    game.integrationType === "drm_free";

  const description =
    game.description ??
    "No description available.";

  const shortDescription =
    description.match(
      /^.*?[.!?](?:\s|$)/
    )?.[0]?.trim() ?? description;

  const handleOpenGame = () => {
    navigate(
      role === "developer"
        ? `/games/${game.id}/monitoring`
        : `/games/${game.id}/learn`
    );
  };

  useLayoutEffect(() => {
    if (!selected) {
      return;
    }

    const updatePopupPosition = () => {
      const card = cardRef.current;
      const popup = popupRef.current;

      if (!card || !popup) {
        return;
      }

      const cardRect =
        card.getBoundingClientRect();

      const popupWidth =
        popup.offsetWidth;

      const popupHeight =
        popup.offsetHeight;

      const gap = 10;
      const viewportMargin = 16;

      let left =
        cardRect.right + gap;

      const maxLeft =
        window.innerWidth -
        popupWidth -
        viewportMargin;

      left = Math.min(
        left,
        maxLeft
      );

      left = Math.max(
        viewportMargin,
        left
      );

      let top =
        cardRect.top + 12;

      const maxTop =
        window.innerHeight -
        popupHeight -
        viewportMargin;

      top = Math.min(
        top,
        maxTop
      );

      top = Math.max(
        viewportMargin,
        top
      );

      setPopupPosition({
        top,
        left,
      });
    };

    updatePopupPosition();

    window.addEventListener(
      "resize",
      updatePopupPosition
    );

    window.addEventListener(
      "scroll",
      updatePopupPosition,
      true
    );

    return () => {
      window.removeEventListener(
        "resize",
        updatePopupPosition
      );

      window.removeEventListener(
        "scroll",
        updatePopupPosition,
        true
      );
    };
  }, [selected]);

  return (
    <article
      ref={cardRef}
      className={`game-card ${
        selected ? "selected" : ""
      }`}
    >
      <button
        type="button"
        className="game-card-tile"
        onClick={() =>
          onSelect(game.id)
        }
        aria-expanded={selected}
      >
        <div className="game-card-image">
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt={`${game.title} cover`}
            />
          ) : (
            <div className="game-card-no-cover">
              No cover available
            </div>
          )}
        </div>

        <div className="game-card-name">
          {game.title}
        </div>
      </button>

      {selected && (
        <div
          ref={popupRef}
          className="game-info-popup"
          style={{
            top: popupPosition.top,
            left: popupPosition.left,
          }}
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <button
            type="button"
            className="game-popup-close"
            onClick={() =>
              onSelect(game.id)
            }
            aria-label="Close game details"
          >
            ×
          </button>

          <span className="game-type">
            {isDrmFree
              ? "DRM-Free"
              : "SDK-Integrated"}
          </span>

          <h2>{game.title}</h2>

          <p className="game-developer">
            {developer ===
            "Studio not listed"
              ? developer
              : `by ${developer}`}
          </p>

          <p className="game-description">
            {shortDescription}
          </p>

          <button
            type="button"
            className="analyse-button"
            onClick={handleOpenGame}
          >
            {role === "developer" ? "Open workspace" : "Play & unlock"}
          </button>
        </div>
      )}
    </article>
  );
}

export default GameCard;
