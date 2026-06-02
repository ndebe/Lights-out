import { QRCodeSVG } from 'qrcode.react';

type Props = {
  url: string;
};

export function QRCodePanel({ url }: Props) {
  if (!url) return null;
  return (
    <div className="qr-panel">
      <p className="qr-panel__label">Scan to play</p>
      <QRCodeSVG value={url} size={160} bgColor="#0a0a0a" fgColor="#ffffff" />
      <p className="qr-panel__url">{url}</p>
    </div>
  );
}
