export function SpeakButton({ text }: { text: string }) {
  if (!('speechSynthesis' in window)) return null;
  const speak = () => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-GB';
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };
  return (
    <button type="button" className="speak" onClick={speak} aria-label={`„${text}“ vorlesen`} title="Vorlesen">
      🔊
    </button>
  );
}
