import Swal from 'sweetalert2';

// Toast utility for showing notifications
const toast = {
  /**
   * Show success notification
   * @param message Message to display
   * @param timer Duration in milliseconds
   * @param position Position of the toast notification
   */
  success: (message: string, timer: number = 3000, position: 'top-end' | 'top' | 'top-start' | 'center' | 'bottom' | 'bottom-start' | 'bottom-end' = 'top-end') => {
    Swal.fire({
      title: 'Success',
      text: message,
      icon: 'success',
      toast: true,
      position,
      showConfirmButton: false,
      timer: timer,
      timerProgressBar: true,
      background: '#fff',
      iconColor: '#10b981', // Green
      backdrop: false,
      customClass: {
        popup: 'swal2-toast-custom dark:bg-boxdark dark:text-white',
      }
    });
  },
  
  /**
   * Show error notification
   * @param message Message to display
   * @param timer Duration in milliseconds
   * @param position Position of the toast notification
   */
  error: (message: string, timer: number = 3000, position: 'top-end' | 'top' | 'top-start' | 'center' | 'bottom' | 'bottom-start' | 'bottom-end' = 'top-end') => {
    Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error',
      toast: true,
      position,
      showConfirmButton: false,
      timer: timer,
      timerProgressBar: true,
      background: '#fff',
      iconColor: '#ef4444', // Red
      backdrop: false,
      customClass: {
        popup: 'swal2-toast-custom dark:bg-boxdark dark:text-white',
        container: 'swal2-toast-container-high-z'
      }
    });
  },
  
  /**
   * Show info notification
   * @param message Message to display
   * @param timer Duration in milliseconds
   * @param position Position of the toast notification
   */
  info: (message: string, timer: number = 3000, position: 'top-end' | 'top' | 'top-start' | 'center' | 'bottom' | 'bottom-start' | 'bottom-end' = 'top-end') => {
    Swal.fire({
      title: 'Info',
      text: message,
      icon: 'info',
      toast: true,
      position,
      showConfirmButton: false,
      timer: timer,
      timerProgressBar: true,
      background: '#fff',
      iconColor: '#3b82f6', // Blue
      backdrop: false,
      customClass: {
        popup: 'swal2-toast-custom dark:bg-boxdark dark:text-white',
        container: 'swal2-toast-container-high-z'
      }
    });
  },
  
  /**
   * Show warning notification
   * @param message Message to display
   * @param timer Duration in milliseconds
   * @param position Position of the toast notification
   */
  warning: (message: string, timer: number = 3000, position: 'top-end' | 'top' | 'top-start' | 'center' | 'bottom' | 'bottom-start' | 'bottom-end' = 'top-end') => {
    Swal.fire({
      title: 'Warning',
      text: message,
      icon: 'warning',
      toast: true,
      position,
      showConfirmButton: false,
      timer: timer,
      timerProgressBar: true,
      background: '#fff',
      iconColor: '#f59e0b', // Amber
      backdrop: false,
      customClass: {
        popup: 'swal2-toast-custom dark:bg-boxdark dark:text-white',
        container: 'swal2-toast-container-high-z'
      }
    });
  },
  
  /**
   * Show confirmation dialog
   * @param title Title of the dialog
   * @param text Message to display
   * @param icon Icon to show
   * @returns Promise with result of the confirmation
   */
  confirm: (
    title: string,
    text: string,
    icon: 'warning' | 'question' = 'question',
    confirmButtonText: string = 'Confirm',
    cancelButtonText: string = 'Cancel',
  ) => {
    return Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
      reverseButtons: true,
      confirmButtonColor: icon === 'warning' ? '#f59e0b' : '#3b82f6', // Amber for warning, Blue for others
      cancelButtonColor: '#6b7280', // Gray
      background: '#fff',
      toast: false,
      width: '28rem', // Reduced width
      padding: '1.25rem', // Reduced padding
      position: 'center',
      allowOutsideClick: true, // Allow clicking outside to cancel
      showClass: {
        popup: 'animate__animated animate__fadeIn animate__faster'
      },
      hideClass: {
        popup: 'animate__animated animate__fadeOut animate__faster'
      },
      customClass: {
        popup: 'dark:bg-boxdark dark:text-white swal2-modal',
        confirmButton: icon === 'warning' ? 'swal2-warning-confirm' : 'swal2-default-confirm',
        cancelButton: 'swal2-cancel',
        title: 'text-lg font-semibold',
        htmlContainer: 'text-sm opacity-90',
        icon: icon === 'warning' ? 'swal2-warning-icon' : 'swal2-default-icon',
        actions: 'swal2-actions-compact'
      }
    });
  },

  /** Show the branded account sign-out confirmation. */
  confirmSignOut: (swahili: boolean = false) => {
    return Swal.fire({
      title: swahili ? 'Unataka kutoka?' : 'Sign out?',
      html: `
        <div class="mx-auto max-w-sm text-center">
          <p class="text-sm leading-6 text-gray-500 dark:text-gray-400">
            ${swahili
              ? 'Je, una uhakika unataka kutoka kwenye akaunti yako? Utahitaji kuingia tena ili kufikia dashibodi yako.'
              : 'Are you sure you want to sign out of your account? You’ll need to sign in again to access your dashboard.'}
          </p>
          <div class="mt-4 flex items-center justify-center gap-2 rounded-xl bg-gray-50 px-3 py-2.5 text-xs font-medium text-gray-500 dark:bg-white/5 dark:text-gray-400">
            <svg class="h-4 w-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>
            ${swahili ? 'Mabadiliko yako yote yamehifadhiwa' : 'All your changes have been saved'}
          </div>
        </div>
      `,
      iconHtml: `
        <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-50 to-orange-100 text-red-500 shadow-sm dark:from-red-500/20 dark:to-orange-500/10 dark:text-red-400">
          <svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/></svg>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: swahili ? 'Ndiyo, toka' : 'Yes, sign out',
      cancelButtonText: swahili ? 'Endelea kutumia' : 'Stay signed in',
      reverseButtons: true,
      focusCancel: true,
      buttonsStyling: false,
      width: '28rem',
      padding: '1.5rem',
      background: '#fff',
      showClass: { popup: 'animate__animated animate__fadeInUp animate__faster' },
      hideClass: { popup: 'animate__animated animate__fadeOutDown animate__faster' },
      customClass: {
        popup: 'swal2-modal overflow-hidden rounded-3xl border border-gray-100 dark:border-gray-800 dark:bg-boxdark dark:text-white',
        icon: 'border-0 mt-2 mb-0',
        title: 'mt-3 text-xl font-bold text-gray-900 dark:text-white',
        htmlContainer: 'mt-2',
        actions: 'mt-6 flex w-full gap-3 swal2-actions-compact',
        confirmButton: 'flex-1 rounded-xl bg-red-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-500/20',
        cancelButton: 'flex-1 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200/60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
      },
    });
  },

  /**
   * Show a loading indicator
   * @param title Title to display
   * @param message Message to display
   * @returns Returns the Swal instance that can be used to close the loading indicator
   */
  loading: (title: string = 'Loading', message: string = 'Please wait...') => {
    return Swal.fire({
      title,
      html: `
        <div class="flex flex-col items-center">
          <div class="swal2-loader-ring"></div>
          <p class="mt-3 text-gray-600 dark:text-gray-300">${message}</p>
        </div>
      `,
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      background: '#fff',
      customClass: {
        popup: 'swal2-loading-popup dark:bg-boxdark dark:text-white',
      }
    });
  },

  /**
   * Close a loading indicator or other dialog
   */
  close: () => {
    Swal.close();
  },

  /**
   * Show notification with HTML content
   * @param title Title of the notification
   * @param html HTML content to display
   * @param icon Icon to show
   * @param timer Duration in milliseconds
   * @param position Position of the notification
   */
  html: (
    title: string, 
    html: string, 
    icon: 'success' | 'error' | 'warning' | 'info' | 'question' = 'info',
    timer?: number,
    position: 'top-end' | 'top' | 'top-start' | 'center' | 'bottom' | 'bottom-start' | 'bottom-end' = 'center'
  ) => {
    const isToast = position.includes('top') || position.includes('bottom');
    
    const iconColors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6',
      question: '#8b5cf6'
    };
    
    Swal.fire({
      title,
      icon,
      html,
      position,
      timer,
      timerProgressBar: timer !== undefined,
      showConfirmButton: timer === undefined,
      background: '#fff',
      iconColor: iconColors[icon],
      showClass: isToast ? {} : {
        popup: 'animate__animated animate__fadeIn animate__faster'
      },
      hideClass: isToast ? {} : {
        popup: 'animate__animated animate__fadeOut animate__faster'
      },
      customClass: {
        popup: isToast ? 
          'swal2-toast-custom dark:bg-boxdark dark:text-white' : 
          'swal2-html-popup dark:bg-boxdark dark:text-white',
        title: 'text-lg font-semibold',
        htmlContainer: 'text-sm',
        icon: `swal2-${icon}-icon`,
      }
    });
  },
  
  /**
   * Helper function for CRUD operation messages
   * @param action The action performed (create, update, delete)
   * @param entityType The type of entity (e.g., "category", "business")
   * @param success Whether the operation was successful
   */
  crud: (
    action: 'create' | 'update' | 'delete' | 'fetch', 
    entityType: string, 
    success: boolean = true
  ) => {
    const entityName = entityType.charAt(0).toUpperCase() + entityType.slice(1);
    
    if (success) {
      const messages = {
        create: `${entityName} created successfully`,
        update: `${entityName} updated successfully`,
        delete: `${entityName} deleted successfully`,
        fetch: `${entityName} loaded successfully`
      };
      
      toast.success(messages[action]);
    } else {
      const messages = {
        create: `Failed to create ${entityType}`,
        update: `Failed to update ${entityType}`,
        delete: `Failed to delete ${entityType}`,
        fetch: `Failed to load ${entityType}`
      };
      
      toast.error(messages[action]);
    }
  }
};

export default toast;
