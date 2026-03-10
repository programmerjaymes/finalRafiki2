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
      customClass: {
        popup: 'swal2-toast-custom dark:bg-boxdark dark:text-white',
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
      customClass: {
        popup: 'swal2-toast-custom dark:bg-boxdark dark:text-white',
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
      customClass: {
        popup: 'swal2-toast-custom dark:bg-boxdark dark:text-white',
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
  confirm: (title: string, text: string, icon: 'warning' | 'question' = 'question') => {
    return Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
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