import React from 'react';

const Card = ({
  children,
  title,
  subtitle,
  footer,
  actions,
  className = '',
  bodyClassName = '',
  withDivider = false,
}) => {
  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
      {/* Card Header (optional) */}
      {(title || subtitle || actions) && (
        <div className="px-4 py-5 sm:px-6 flex justify-between items-start border-b border-gray-200">
          <div>
            {title && (
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}

      {/* Card Body */}
      <div className={`px-4 py-5 sm:p-6 ${bodyClassName}`}>
        {children}
      </div>

      {/* Card Footer (optional) */}
      {footer && (
        <>
          {withDivider && <div className="border-t border-gray-200"></div>}
          <div className="px-4 py-4 sm:px-6">{footer}</div>
        </>
      )}
    </div>
  );
};

export default Card;