export default function BackgroundVideo() {
  return (
    <div className="absolute inset-0 z-0">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="object-cover w-full h-full blur-sm brightness-25"
        poster="/images/video-placeholder.png"
        preload="auto"
      >
        <source src="/videos/hibachi.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
