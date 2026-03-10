'use client';

import React from 'react';
import toast from '@/utils/toast';
import Button from '@/components/ui/button/Button';
import Card from '@/components/ui/card/Card';
import Swal from 'sweetalert2';

const ToastDemo = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-semibold mb-6">Toast Notification Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Toasts */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Toast Notifications</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Success Toast</h3>
              <Button onClick={() => toast.success('Operation completed successfully!')}>
                Show Success
              </Button>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Error Toast</h3>
              <Button 
                variant="outline" 
                className="border-error-500 text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20"
                onClick={() => toast.error('Something went wrong!')}
              >
                Show Error
              </Button>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Info Toast</h3>
              <Button 
                variant="outline" 
                className="border-info-500 text-info-500 hover:bg-info-50 dark:hover:bg-info-900/20"
                onClick={() => toast.info('Here is some information')}
              >
                Show Info
              </Button>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Warning Toast</h3>
              <Button 
                variant="outline" 
                className="border-warning-500 text-warning-500 hover:bg-warning-50 dark:hover:bg-warning-900/20"
                onClick={() => toast.warning('Please be careful!')}
              >
                Show Warning
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Position Variants */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Position Variants</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Top End (Default)</h3>
              <Button onClick={() => toast.success('Top end toast', 3000, 'top-end')}>
                Top End
              </Button>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Top</h3>
              <Button onClick={() => toast.success('Top toast', 3000, 'top')}>
                Top
              </Button>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Bottom</h3>
              <Button onClick={() => toast.success('Bottom toast', 3000, 'bottom')}>
                Bottom
              </Button>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Bottom End</h3>
              <Button onClick={() => toast.success('Bottom end toast', 3000, 'bottom-end')}>
                Bottom End
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Modal Dialogs */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Modal Dialogs</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Confirmation Dialog</h3>
              <Button 
                onClick={async () => {
                  const result = await toast.confirm(
                    'Confirmation Required',
                    'Are you sure you want to proceed with this action?',
                    'question'
                  );
                  
                  if (result.isConfirmed) {
                    toast.success('Action confirmed!');
                  } else {
                    toast.info('Action cancelled');
                  }
                }}
              >
                Show Confirm
              </Button>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Loading Indicator</h3>
              <Button 
                onClick={() => {
                  const loading = toast.loading('Processing', 'Please wait while we process your request...');
                  
                  // Simulate async operation
                  setTimeout(() => {
                    toast.close();
                    toast.success('Processing complete!');
                  }, 2000);
                }}
              >
                Show Loading
              </Button>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">HTML Content</h3>
              <Button 
                onClick={() => {
                  toast.html(
                    'Rich Content',
                    `
                    <div class="text-center">
                      <div class="flex justify-center mb-4">
                        <div class="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <p class="mb-2">This is a <strong>rich HTML</strong> notification with custom styling.</p>
                      <div class="flex justify-center gap-2 mt-4">
                        <span class="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">Tag 1</span>
                        <span class="px-2 py-1 bg-success-100 text-success-700 rounded-full text-xs">Tag 2</span>
                        <span class="px-2 py-1 bg-warning-100 text-warning-700 rounded-full text-xs">Tag 3</span>
                      </div>
                    </div>
                    `,
                    'info'
                  );
                }}
              >
                Show HTML
              </Button>
            </div>
          </div>
        </Card>
        
        {/* CRUD Helpers */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">CRUD Operation Helpers</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Create Success</h3>
              <Button onClick={() => toast.crud('create', 'user')}>
                Show Create Success
              </Button>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Update Success</h3>
              <Button onClick={() => toast.crud('update', 'product')}>
                Show Update Success
              </Button>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Delete Success</h3>
              <Button onClick={() => toast.crud('delete', 'post')}>
                Show Delete Success
              </Button>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">CRUD Error</h3>
              <Button 
                variant="outline" 
                className="border-error-500 text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20"
                onClick={() => toast.crud('update', 'order', false)}
              >
                Show CRUD Error
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Advanced Customization */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Advanced Customization</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Custom Icon</h3>
              <Button 
                onClick={() => {
                  Swal.fire({
                    title: 'Custom Icon',
                    text: 'This alert has a custom icon',
                    iconHtml: '<i class="text-3xl">🚀</i>',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    background: '#fff',
                    customClass: {
                      popup: 'swal2-toast-custom dark:bg-boxdark dark:text-white',
                    }
                  });
                }}
              >
                Custom Icon
              </Button>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Auto Close Timer</h3>
              <Button 
                onClick={() => {
                  toast.success('This will close in 10 seconds', 10000);
                }}
              >
                10 Second Timer
              </Button>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Sticky Toast (No Auto Close)</h3>
              <Button 
                onClick={() => {
                  Swal.fire({
                    title: 'Sticky Toast',
                    text: 'This toast will not auto-close',
                    icon: 'info',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: true,
                    background: '#fff',
                    confirmButtonText: 'Dismiss',
                    confirmButtonColor: '#3b82f6',
                    customClass: {
                      popup: 'swal2-toast-custom dark:bg-boxdark dark:text-white',
                    }
                  });
                }}
              >
                Sticky Toast
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ToastDemo; 