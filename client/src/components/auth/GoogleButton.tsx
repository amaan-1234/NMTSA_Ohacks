import React from "react";
import { Button } from "@/components/ui/button";

const GoogleIcon = () => (
  <svg viewBox="0 0 533.5 544.3" className="h-4 w-4" aria-hidden="true">
    <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272v95.4h147c-6.3 34.1-25.1 63-53.4 82.3l86.3 66.9c50.4-46.6 81.6-115.3 81.6-194.2z"/>
    <path fill="#34A853" d="M272 544.3c72.9 0 134.1-24.1 178.8-65.3l-86.3-66.9c-24.1 16.1-54.7 25.7-92.5 25.7-71.1 0-131.5-47.9-153.2-112.4H29.5v70.6C73.9 486.4 167.1 544.3 272 544.3z"/>
    <path fill="#FBBC04" d="M118.8 325.3c-8.9-26.8-8.9-55.7 0-82.5V172.2H29.5c-38.4 76.7-38.4 167.5 0 244.2l89.3-91.1z"/>
    <path fill="#EA4335" d="M272 106.2c39.7-.6 77.9 14.9 106.6 42.6l79.7-79.7C406.1 24.1 344.9 0 272 0 167.1 0 73.9 57.9 29.5 172.2l89.3 70.6C140.5 154.1 200.9 106.2 272 106.2z"/>
  </svg>
);

const GoogleButton: React.FC<React.ComponentProps<typeof Button>> = ({ children, ...props }) => (
  <Button variant="outline" className="w-full gap-2" {...props}>
    <GoogleIcon /> {children ?? "Continue with Google"}
  </Button>
);

export default GoogleButton;
