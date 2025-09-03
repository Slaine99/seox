import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const ClientRegisterRedirect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if this is a client invitation
    const invitationToken = searchParams.get('invitation');
    const token = searchParams.get('token');
    const urlToken = window.location.pathname.split('/').pop();

    if (invitationToken || token || urlToken) {
      // Redirect to client registration with the token
      const finalToken = invitationToken || token || urlToken;
      navigate(`/client/register/${finalToken}`, { replace: true });
    } else {
      // Show error for clients trying to register without invitation
      toast.error('Client registration requires an invitation. Please check your email for the invitation link.');
      setLoading(false);
    }
  }, [navigate, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to client registration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full mx-4 text-center">
        <div className="text-red-500 mb-4">
          <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Invitation Required</h2>
        <p className="text-gray-600 mb-6">
          Client registration requires an invitation. Please check your email for the invitation link from your SEO agency.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
};

export default ClientRegisterRedirect;
