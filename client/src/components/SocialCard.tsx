interface SocialCardProps {
  platform: string;
  username: string;
  icon: string;
  bgColorClass: string;
  url: string;
}

export default function SocialCard({ platform, username, icon, bgColorClass, url }: SocialCardProps) {
  const getBgColorClass = (color: string) => {
    switch (color) {
      case "primary":
        return "bg-primary/10 text-primary";
      case "secondary":
        return "bg-[#81C784]/10 text-[#81C784]";
      case "accent":
        return "bg-[#FFD54F]/10 text-[#FFD54F]";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="social-card bg-white rounded-lg p-5 flex items-center transition-all duration-300 border border-neutral-200 hover:border-primary"
    >
      <div className={`w-12 h-12 rounded-full ${getBgColorClass(bgColorClass)} flex items-center justify-center mr-4`}>
        <i className={`${icon} text-2xl`}></i>
      </div>
      <div>
        <h3 className="font-medium">{platform}</h3>
        <p className="text-sm text-gray-700">{username}</p>
      </div>
      <i className="ri-arrow-right-line ml-auto text-primary"></i>
    </a>
  );
}
