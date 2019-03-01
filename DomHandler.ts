export class DomHandler {
  public static zindex: number = 1000;

  public static addClass(element: any, className: string): void {
    if (element.classList) element.classList.add(className);
    else element.className += ' ' + className;
  }
  public static removeClass(element: any, className: string): void {
    if (element.classList) element.classList.remove(className);
    else
      element.className = element.className.replace(
        new RegExp(
          '(^|\\b)' + className.split(' ').join('|') + '(\\b|$)',
          'gi'
        ),
        ' '
      );
  }
}
