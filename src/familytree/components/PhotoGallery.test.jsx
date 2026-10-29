import { fireEvent, render, screen, cleanup } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import PhotoGallery from './PhotoGallery.jsx';
beforeAll(() => {
  globalThis.ResizeObserver = class { observe() {} disconnect() {} };
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); this.querySelector('button')?.focus(); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
});
afterEach(cleanup);
const photos = Array.from({ length: 5 }, (_, i) => ({ src: `/test-${i}.webp`, caption: `Memory ${i}`, year: 2000 + i }));
describe('person photographs', () => {
  it('hides absent, empty, and invalid photographs', () => {
    const { rerender, container } = render(<PhotoGallery name="Jennifer"/>);
    expect(container).toBeEmptyDOMElement();
    rerender(<PhotoGallery name="Jennifer" photos={[]}/>);
    expect(container).toBeEmptyDOMElement();
    rerender(<PhotoGallery name="Jennifer" photos={[{ caption: 'No source' }]}/>);
    expect(container).toBeEmptyDOMElement();
  });
  it('shows three photos without an overflow count', () => {
    render(<PhotoGallery name="Jennifer" photos={photos.slice(0, 3)}/>);
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.queryByText('+2')).not.toBeInTheDocument();
  });
  it('opens the selected image, navigates, wraps, and restores focus', () => {
    render(<PhotoGallery name="Jennifer" photos={photos}/>);
    expect(screen.getByText('+2')).toBeInTheDocument();
    const thumbnail = screen.getByRole('button', { name: /Open photograph 3/ });
    thumbnail.focus(); fireEvent.click(thumbnail);
    const dialog = screen.getByRole('dialog');
    expect(screen.getByText('3 / 5')).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    expect(screen.getByText('4 / 5')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next photograph' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next photograph' }));
    expect(screen.getByText('1 / 5')).toBeInTheDocument();
    fireEvent.touchStart(screen.getByRole('figure'), { touches: [{ clientX: 200, clientY: 100 }] });
    fireEvent.touchEnd(screen.getByRole('figure'), { changedTouches: [{ clientX: 100, clientY: 105 }] });
    expect(screen.getByText('2 / 5')).toBeInTheDocument();
    fireEvent(dialog, new Event('cancel', { cancelable: true }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(thumbnail).toHaveFocus();
  });
  it('dismisses via backdrop and omits navigation for one photo', () => {
    render(<PhotoGallery name="Jennifer" photos={[{ src: '/one.webp' }]}/>);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByRole('button', { name: 'Next photograph' })).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Photograph 1 of Jennifer' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('dialog'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
