function fadeIn(element, duration = 500) {
  if (!element) return;
  
  // Set initial opacity
  element.style.opacity = 0;
  element.classList.remove('hidden');
  
  // Animate opacity
  let start = null;
  
  function animate(timestamp) {
    if (!start) start = timestamp;
    const progress = timestamp - start;
    const opacity = Math.min(progress / duration, 1);
    
    element.style.opacity = opacity;
    
    if (progress < duration) {
      window.requestAnimationFrame(animate);
    }
  }
  
  window.requestAnimationFrame(animate);
}

function fadeOut(element, duration = 500) {
  if (!element) return;
  
  return new Promise(resolve => {
    // Set initial opacity
    element.style.opacity = 1;
    
    // Animate opacity
    let start = null;
    
    function animate(timestamp) {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const opacity = Math.max(1 - (progress / duration), 0);
      
      element.style.opacity = opacity;
      
      if (progress < duration) {
        window.requestAnimationFrame(animate);
      } else {
        element.classList.add('hidden');
        resolve();
      }
    }
    
    window.requestAnimationFrame(animate);
  });
} 