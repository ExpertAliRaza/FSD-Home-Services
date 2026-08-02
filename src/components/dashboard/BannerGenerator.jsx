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
    discount: '20% OFF',
    subtitle: 'Aapki agli service par',
    descriptionLine1: 'Koi bhi home service book karen aur',
    descriptionLine2: 'checkout par ye code istemal karen.',
    couponCode: 'WELCOME20',
    expiryText: 'Valid till 30 Aug 2026',
    contactNumber: '0321-1234567'
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
    
    // Background solid (Coral)
    ctx.fillStyle = '#D85A30';
    ctx.beginPath();
    ctx.roundRect(0, 0, 680, 380, 16);
    ctx.fill();

    // Decorative Circles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.arc(580, 100, 180, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(100, 350, 120, 0, Math.PI * 2);
    ctx.fill();

    // Content
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillText('FSD HOME SERVICES', 40, 50);

    // Large Discount text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 64px Inter, sans-serif';
    ctx.fillText(couponData.discount, 40, 140);
    
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillStyle = '#ffedd5'; 
    ctx.fillText(couponData.subtitle, 40, 180);

    // Description
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText(couponData.descriptionLine1, 40, 230);
    ctx.fillText(couponData.descriptionLine2, 40, 255);

    // Coupon Box
    ctx.strokeStyle = 'white';
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(420, 110, 220, 90, 8);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText('USE COUPON CODE', 530, 135);
    
    ctx.font = 'bold 26px monospace';
    ctx.fillText(couponData.couponCode, 530, 170);

    // Expiry text inside the box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText(couponData.expiryText, 530, 190);

    // Footer contact
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText(`WhatsApp: ${couponData.contactNumber}`, 40, 340);

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
                    <label className="mb-1 block text-sm font-medium text-slate-700">Discount Text</label>
                    <input type="text" name="discount" value={couponData.discount} onChange={handleCouponChange} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Subtitle</label>
                    <input type="text" name="subtitle" value={couponData.subtitle} onChange={handleCouponChange} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Description Line 1</label>
                    <input type="text" name="descriptionLine1" value={couponData.descriptionLine1} onChange={handleCouponChange} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">Description Line 2</label>
                    <input type="text" name="descriptionLine2" value={couponData.descriptionLine2} onChange={handleCouponChange} className="w-full rounded-md border border-slate-300 p-2 text-sm" />
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
