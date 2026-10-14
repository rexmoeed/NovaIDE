import React from 'react';

export const VulnerableClient: React.FC = () => {
  // Sensitive secret with VITE_ prefix exposed to public client bundle
  const clientSecret = import.meta.env.VITE_API_SECRET || 'secret-token';
  const rawHtml = '<img src=x onerror=alert(1)>';

  return (
    <div>
      <h1>Fixture Client</h1>
      {/* UNSANITIZED DANGEROUSLY SET INNER HTML */}
      <div dangerouslySetInnerHTML={{ __html: rawHtml }} />
    </div>
  );
};
