// Add this to your existing index.js file or create a new script
document.addEventListener('DOMContentLoaded', function() {
    // Get all sections that need to be animated
    const sections = document.querySelectorAll('.card');
    
    // Set initial state for all sections (off-screen)
    sections.forEach((section, index) => {
      section.style.opacity = '0';
      section.style.transform = 'translateX(50px)';
      section.style.transition = 'all 0.5s ease-out';
      
      // Add a delay based on section position
      const delay = 100 + (index * 150);
      
      // Trigger the animation after the delay
      setTimeout(() => {
        section.style.opacity = '1';
        section.style.transform = 'translateX(0)';
      }, delay);
    });
    
    // Also animate the header
    const header = document.querySelector('.header');
    if (header) {
      header.style.opacity = '0';
      header.style.transform = 'translateY(-20px)';
      header.style.transition = 'all 0.5s ease-out';
      
      setTimeout(() => {
        header.style.opacity = '1';
        header.style.transform = 'translateY(0)';
      }, 100);
    }
  });