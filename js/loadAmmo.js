export const loadAmmo = async () => {
    // Load the Ammo.js script first
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/node_modules/ammojs3/builds/ammo.js';
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  
    // Initialize Ammo
    return new Promise((resolve, reject) => {
      try {
        window.Ammo().then((AmmoLib) => {
          resolve(AmmoLib);
        });
      } catch (error) {
        reject(error);
      }
    });
  };