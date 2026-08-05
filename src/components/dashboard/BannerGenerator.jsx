import { useState, useEffect, useRef, useCallback } from 'react';
import { Download, Image as ImageIcon } from 'lucide-react';

export function BannerGenerator() {
  const [activeTab, setActiveTab] = useState('referral');
  const canvasRef = useRef(null);

  // Form State
  const [referralData, setReferralData] = useState({
    heading: 'Apna dost refer karo',
    rewardText: 'Rs. 200 tak kamao',
    descriptionLine1: 'Doston aur family ko FSD Home Services',
    descriptionLine2: 'par verified workers se connect karen.',
    referralCode: '0300-1234567',
    contactNumber: '0321-1234567'
  });

  const [couponData, setCouponData] = useState({
    discountType: 'FLAT',
    discountAmount: 'Rs. 200 OFF',
    subtitle: 'Your First Service',
    minBooking: 'Minimum Booking Rs. 1000',
    couponCode: 'HOME200',
    expiryText: 'Valid till 30 Aug 2026',
    contactNumber: '0309-9018308'
  });

  // Draw Functions
  const drawReferralBanner = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Background gradient (Teal)
    const gradient = ctx.createLinearGradient(0, 0, 680, 380);
    gradient.addColorStop(0, '#0f766e');
    gradient.addColorStop(1, '#0b5c56');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, 680, 380, 16);
    ctx.fill();

    // Decorative Circles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.arc(600, -50, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(50, 400, 200, 0, Math.PI * 2);
    ctx.fill();

    // Content
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('FSD HOME SERVICES', 40, 50);

    // White Box "Refer & Earn"
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.roundRect(40, 80, 120, 30, 15);
    ctx.fill();
    ctx.fillStyle = '#0f766e';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText('Refer & Earn', 55, 100);

    // Large Heading
    ctx.textAlign = 'left';
    ctx.fillStyle = 'white';
    ctx.font = 'bold 30px Inter, sans-serif';
    ctx.fillText(referralData.heading, 40, 160);
    ctx.font = 'bold 38px Inter, sans-serif';
    ctx.fillStyle = '#a7f3d0'; // Light emerald text
    ctx.fillText(referralData.rewardText, 40, 205);

    // Description
    ctx.fillStyle = '#ccfbf1';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText(referralData.descriptionLine1, 40, 250);
    ctx.fillText(referralData.descriptionLine2, 40, 275);

    // Referral Code Box
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.setLineDash([8, 4]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(410, 145, 230, 80, 8);
    ctx.stroke();
    ctx.setLineDash([]); // reset dash

    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText('YOUR REFERRAL CODE', 525, 170);
    
    ctx.font = 'bold 22px monospace';
    ctx.fillText(referralData.referralCode, 525, 205);

    // Footer contact
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText(`WhatsApp: ${referralData.contactNumber}`, 40, 340);

  }, [referralData]);

  const drawCouponBanner = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Background gradient (Dark Orange)
    const gradient = ctx.createLinearGradient(0, 0, 680, 380);
    gradient.addColorStop(0, '#C54602');
    gradient.addColorStop(1, '#9A3000');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(0, 0, 680, 380, 16);
    ctx.fill();

    // Subtle wavy pattern
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.beginPath();
    ctx.moveTo(0, 380);
    ctx.lineTo(0, 150);
    ctx.bezierCurveTo(200, 280, 400, 80, 680, 220);
    ctx.lineTo(680, 380);
    ctx.fill();

    // Set default baseline
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // -- TOP LEFT: LOGO & BRANDING --
    // House (Lucide Home path)
    const homePath = new Path2D("m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10");
    ctx.save();
    ctx.translate(28, 25); // Position
    ctx.scale(1.5, 1.5);
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = 'white';
    ctx.stroke(homePath);
    ctx.restore();

    // Brand Text
    ctx.textAlign = 'left';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText('FSD HOME SERVICES', 85, 38);
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillText('— YOUR TRUSTED PARTNER —', 85, 56);

    // -- MAIN DISCOUNT TEXT --
    ctx.font = 'bold 18px Inter, sans-serif';
    ctx.fillStyle = 'white';
    ctx.fillText(couponData.discountType, 30, 105);
    
    ctx.font = 'bold 58px Inter, sans-serif';
    ctx.fillText(couponData.discountAmount, 26, 145);
    
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText(couponData.subtitle, 30, 195);

    // -- RIGHT SIDE: COUPON BOX --
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.setLineDash([8, 8]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(415, 60, 230, 150, 12);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('USE COUPON CODE', 530, 85);
    
    // White Box for code
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.roundRect(435, 102, 190, 42, 8);
    ctx.fill();

    ctx.fillStyle = '#A63200';
    ctx.font = 'bold 30px Inter, sans-serif';
    ctx.fillText(couponData.couponCode, 530, 124);

    // Separators and text inside dashed box
    ctx.fillStyle = 'white';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText(couponData.minBooking, 530, 163);
    
    ctx.beginPath();
    ctx.moveTo(445, 180);
    ctx.lineTo(615, 180);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = 'white';
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillText(couponData.expiryText, 530, 195);

    // -- BOTTOM SECTION: OUR SERVICES --
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.fillText('OUR SERVICES', 340, 245);
    
    ctx.beginPath();
    ctx.moveTo(240, 245);
    ctx.lineTo(300, 245);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(380, 245);
    ctx.lineTo(440, 245);
    ctx.stroke();

    // Services icons and text
    const services = ['PLUMBING', 'ELECTRICAL', 'AC REPAIR', 'PAINTING', 'CARPENTRY'];
    const serviceX = [85, 212, 340, 467, 595];
    
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1.8;

    for (let i = 0; i < services.length; i++) {
      const sx = serviceX[i];
      const sy = 285; // Icon Center Y
      
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1.8;
      
      // Draw accurate SVG icons using Path2D
      ctx.save();
      ctx.translate(sx - 12, sy - 12); // Center 24x24 icon exactly at sx, sy
      
      if (i === 0) { // Droplet
        const droplet = new Path2D("M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z");
        ctx.stroke(droplet);
      } else if (i === 1) { // Zap
        const zap = new Path2D("M13 2L3 14h9l-1 8 10-12h-9l1-8z");
        ctx.stroke(zap);
      } else if (i === 2) { // Wind/AC
        const wind = new Path2D("M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2");
        ctx.stroke(wind);
      } else if (i === 3) { // Roller
        ctx.roundRect(1, 1, 16, 8, 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(17, 5); ctx.lineTo(21, 5); ctx.lineTo(21, 13); ctx.lineTo(10, 13); ctx.lineTo(10, 17);
        ctx.stroke();
        ctx.beginPath(); ctx.roundRect(8, 17, 4, 6, 1); ctx.stroke();
      } else if (i === 4) { // Wrench
        const wrench = new Path2D("M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z");
        ctx.stroke(wrench);
      }
      ctx.restore();
      
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.fillStyle = 'white';
      ctx.fillText(services[i], sx, 315);
      
      // Bottom dash
      ctx.beginPath();
      ctx.moveTo(sx-10, 326);
      ctx.lineTo(sx+10, 326);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.stroke();
      
      if (i < services.length - 1) {
         // Vertical separator
         ctx.beginPath();
         ctx.moveTo(sx + 63, 265);
         ctx.lineTo(sx + 63, 325);
         ctx.lineWidth = 1;
         ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
         ctx.stroke();
      }
    }

    // -- BOTTOM WHATSAPP BUBBLE --
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(170, 340, 340, 34, 17);
    ctx.fill();
    ctx.stroke();
    
    // WhatsApp Logo (Lucide MessageCircle)
    const msgPath = new Path2D("M7.9 20A9 9 0 1 0 4 16.1L2 22Z");
    ctx.save();
    ctx.translate(210, 345); // Y=357 is center, so Y=345 puts it right in the 340-374 bubble
    ctx.scale(0.9, 0.9);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'white';
    ctx.stroke(msgPath);
    ctx.restore();

    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.font = '15px Inter, sans-serif';
    ctx.fillText(`WhatsApp:`, 245, 357);
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.fillText(couponData.contactNumber, 325, 357);

  }, [couponData]);

  useEffect(() => {
    // Fonts loading lag could make it render wrong initially, so we clear and draw
    // Ensure Inter is loaded (it is from Google Fonts in index.html)
    document.fonts.ready.then(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      if (activeTab === 'referral') {
        drawReferralBanner();
      } else {
        drawCouponBanner();
      }
    });
  }, [activeTab, drawReferralBanner, drawCouponBanner]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `${activeTab}-banner-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReferralChange = (e) => {
    setReferralData({ ...referralData, [e.target.name]: e.target.value });
  };

  const handleCouponChange = (e) => {
    setCouponData({ ...couponData, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Banner Generator</h1>
          <p className="text-slate-600">Create beautiful promotional banners for WhatsApp and Social Media.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Editor Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex space-x-2 rounded-lg bg-slate-100 p-1 mb-6">
              <button
                className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${activeTab === 'referral' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                onClick={() => setActiveTab('referral')}
              >
                Referral Banner
              </button>
              <button
                className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${activeTab === 'coupon' ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                onClick={() => setActiveTab('coupon')}
              >
                Coupon Banner
              </button>
            </div>

            <div className="space-y-4">
              {activeTab === 'referral' ? (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Heading</label>
                    <input type="text" name="heading" value={referralData.heading} onChange={handleReferralChange} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Reward Text</label>
                    <input type="text" name="rewardText" value={referralData.rewardText} onChange={handleReferralChange} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Description Line 1</label>
                    <input type="text" name="descriptionLine1" value={referralData.descriptionLine1} onChange={handleReferralChange} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Description Line 2</label>
                    <input type="text" name="descriptionLine2" value={referralData.descriptionLine2} onChange={handleReferralChange} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Referral Code</label>
                    <input type="text" name="referralCode" value={referralData.referralCode} onChange={handleReferralChange} className="w-full rounded-md border border-slate-300 p-2 text-sm font-mono" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">WhatsApp Number</label>
                    <input type="text" name="contactNumber" value={referralData.contactNumber} onChange={handleReferralChange} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Discount Type (e.g. FLAT)</label>
                    <input type="text" name="discountType" value={couponData.discountType} onChange={handleCouponChange} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Discount Amount</label>
                    <input type="text" name="discountAmount" value={couponData.discountAmount} onChange={handleCouponChange} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Subtitle</label>
                    <input type="text" name="subtitle" value={couponData.subtitle} onChange={handleCouponChange} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Minimum Booking Text</label>
                    <input type="text" name="minBooking" value={couponData.minBooking} onChange={handleCouponChange} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Coupon Code</label>
                    <input type="text" name="couponCode" value={couponData.couponCode} onChange={handleCouponChange} className="w-full rounded-md border border-slate-300 p-2 text-sm font-mono" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Expiry Text</label>
                    <input type="text" name="expiryText" value={couponData.expiryText} onChange={handleCouponChange} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">WhatsApp Number</label>
                    <input type="text" name="contactNumber" value={couponData.contactNumber} onChange={handleCouponChange} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Live Preview & Export */}
        <div className="lg:col-span-8 flex flex-col items-center border border-slate-200 bg-slate-50 p-6 rounded-xl">
          <div className="flex w-full items-center justify-between mb-4">
            <h3 className="font-bold flex items-center gap-2"><ImageIcon size={18} /> Live Preview</h3>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded bg-brand-700 px-4 py-2 text-sm font-bold text-white hover:bg-brand-800"
            >
              <Download size={16} /> Download PNG
            </button>
          </div>
          
          <div className="overflow-x-auto w-full flex justify-center bg-transparent drop-shadow-xl rounded-2xl">
            <canvas 
              ref={canvasRef} 
              width={680} 
              height={380} 
              className="rounded-2xl bg-white max-w-full h-auto"
            />
          </div>
          <p className="mt-4 text-xs text-slate-500 text-center">Size: 680x380 px. Perfect for WhatsApp forwarding.</p>
        </div>
      </div>
    </div>
  );
}
