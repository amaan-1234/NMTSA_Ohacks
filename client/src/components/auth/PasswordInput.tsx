import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = React.ComponentProps<typeof Input>;

const PasswordInput: React.FC<Props> = ({ ...rest }) => {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <Input type={show ? "text" : "password"} {...rest} />
      <Button type="button" variant="ghost" size="sm"
        className="absolute right-1 top-1/2 translate-y-1 h-7 px-2 text-xs"
        onClick={() => setShow((s) => !s)}
      >
        {show ? "Hide" : "Show"}
      </Button>
    </div>
  );
};

export default PasswordInput;
