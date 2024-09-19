import React from 'react';
import Image from 'next/image';

interface LogoIconProps extends React.ComponentPropsWithoutRef<typeof Image> {}

export const LogoIcon: React.FC<LogoIconProps> = ({ className, ...props }) => {
  return (
    <Image
      className={`${className || ''} animate-jump`}
      {...props}
    />
  );
};