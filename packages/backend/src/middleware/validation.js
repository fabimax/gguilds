/**
 * Request validation middleware
 * 
 * A simple validation middleware to handle request body validation
 * For a production app, you might want to use express-validator or Joi
 */

/**
 * Validates a request body against provided field validations
 * 
 * @param {Array} validations - Array of validation objects
 * @returns {Function} Express middleware function
 * 
 * Example usage:
 * validateRequest([
 *   {
 *     field: 'email',
 *     validations: ['required', 'email']
 *   },
 *   {
 *     field: 'password',
 *     validations: ['required', 'min:6']
 *   }
 * ])
 */
exports.validateRequest = (validations) => {
    return (req, res, next) => {
      const errors = {};
      
      validations.forEach(validation => {
        const { field, validations: rules } = validation;
        const value = req.body[field];
        
        // Apply each validation rule
        rules.forEach(rule => {
          if (rule === 'required' && !value) {
            errors[field] = errors[field] || [];
            errors[field].push(`${field} is required`);
          } 
          else if (rule === 'email' && value && !isValidEmail(value)) {
            errors[field] = errors[field] || [];
            errors[field].push(`${field} must be a valid email address`);
          }
          else if (rule === 'optional' && !value) {
            // Optional fields can be empty, do nothing
          } 
          else if (rule.startsWith('min:') && value) {
            const minLength = parseInt(rule.split(':')[1]);
            if (value.length < minLength) {
              errors[field] = errors[field] || [];
              errors[field].push(`${field} must be at least ${minLength} characters long`);
            }
          }
          else if (rule.startsWith('max:') && value) {
            const maxLength = parseInt(rule.split(':')[1]);
            if (value.length > maxLength) {
              errors[field] = errors[field] || [];
              errors[field].push(`${field} must be at most ${maxLength} characters long`);
            }
          }
        });
      });
      
      // If there are validation errors, return them
      if (Object.keys(errors).length > 0) {
        return res.status(400).json({ 
          error: true, 
          message: 'Validation failed', 
          errors 
        });
      }
      
      // No errors, proceed to the controller
      next();
    };
  };
  
  /**
   * Simple email validation function
   * @param {string} email - Email to validate
   * @returns {boolean} - Whether the email is valid
   */
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }