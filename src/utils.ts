export function toSnakeCaseString(str: string): string {
    return str.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/^(\d)/, '_$1');
}

export function toCamelCaseString(input: string): string {
    const words = input
      .replace(/[^a-zA-Z0-9']/g, ' ')
      .replace(/'+/g, '')
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0);
  
    if (words.length === 0) return '_';
  

    const camelCase = words
      .map((word, index) => 
        index === 0 
          ? word.toLowerCase() 
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join('');
  

    return camelCase.length === 0 
      ? '_' 
      : camelCase.replace(/^(\d)/, '_$1');
}

export function capitalizeFirstLetter(input: string): string {
    return input.charAt(0).toUpperCase() + input.slice(1);
}