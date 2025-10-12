import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";
import clsx from "clsx";

type Props = {
  title: string;
  subtitle?: string;
  illustration?: string;       // optional small image above title
  alignTop?: boolean;          // NEW: align content to top of the card
  children: React.ReactNode;
  footer?: React.ReactNode;
};

const AuthShell: React.FC<Props> = ({ title, subtitle, illustration, alignTop, children, footer }) => {
  const [, setLocation] = useLocation();
  const [imgLoaded, setImgLoaded] = React.useState(false);

  React.useEffect(() => setImgLoaded(false), [illustration]);

  return (
    <div className={clsx("w-full flex justify-center", alignTop ? "pt-4" : "py-8")}>
      <Card className="w-[390px] max-w-[92vw] rounded-3xl border shadow-lg overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-2 p-4">
          <Button variant="ghost" size="icon" onClick={() => history.length > 1 ? history.back() : setLocation("/")}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm text-muted-foreground">Back</span>
        </div>

        {/* Show illustration only when it actually loads (prevents empty gap) */}
        {illustration && (
          <div className={clsx("px-6", imgLoaded ? "pt-2" : "p-0 h-0 overflow-hidden")}>
            <img
              src={illustration}
              alt=""
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgLoaded(false)}
              className="mx-auto h-28 object-contain"
            />
          </div>
        )}

        <div className="px-6 pt-2">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>

        <div className={clsx("px-6", alignTop ? "py-3" : "py-4")}>{children}</div>

        {footer && <div className="px-6 pb-6">{footer}</div>}
      </Card>
    </div>
  );
};

export default AuthShell;