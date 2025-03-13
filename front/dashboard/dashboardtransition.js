// Add this to a new dashboard.js file or existing script file
document.addEventListener('DOMContentLoaded', function() {
    // Animate the header first
    const header = document.querySelector('.header');
    if (header) {
      header.style.opacity = '0';
      header.style.transform = 'translateY(-30px)';
      header.style.transition = 'all 0.8s ease-out';
      
      setTimeout(() => {
        header.style.opacity = '1';
        header.style.transform = 'translateY(0)';
      }, 100);
    }
    
    // Animate the dashboard section title
    const dashboardTitle = document.querySelector('.dashboard-section h1');
    if (dashboardTitle) {
      dashboardTitle.style.opacity = '0';
      dashboardTitle.style.transform = 'translateY(-20px)';
      dashboardTitle.style.transition = 'all 0.6s ease-out';
      
      setTimeout(() => {
        dashboardTitle.style.opacity = '1';
        dashboardTitle.style.transform = 'translateY(0)';
      }, 400);
    }
    
    // Animate each card with a staggered delay
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateX(40px)';
      card.style.transition = 'all 0.5s ease-out';
      
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateX(0)';
      }, 600 + (index * 150));
    });
    
    // Animate each section with a staggered delay
    const sections = document.querySelectorAll('.section');
    sections.forEach((section, index) => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(30px)';
      section.style.transition = 'all 0.7s ease-out';
      
      setTimeout(() => {
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
      }, 1000 + (index * 200));
    });
  });