import { useEffect, useState } from 'react';

/**
 * Quarterly Review Page
 * Loads the quarterly review HTML application in an iframe
 */
export default function QuarterlyReview() {
  const [iframeHeight, setIframeHeight] = useState('100vh');

  useEffect(() => {
    // Listen for messages from iframe to adjust height
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'resize') {
        setIframeHeight(`${event.data.height}px`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <div className="w-full h-full">
      <iframe
        src="/quarterly-review.html"
        className="w-full border-0"
        style={{ height: iframeHeight, minHeight: '100vh' }}
        title="Quarterly Review"
      />
    </div>
  );
}
