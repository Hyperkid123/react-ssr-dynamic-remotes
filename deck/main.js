import Reveal from 'reveal.js';
import Markdown from 'reveal.js/plugin/markdown/markdown.esm.js';
import RevealHighlight from 'reveal.js/plugin/highlight/highlight'
import Notes from 'reveal.js/plugin/notes/notes'
import 'reveal.js/dist/reveal.css'
import 'reveal.js/dist/theme/black.css'
import 'highlight.js/styles/vs2015.css'
import './style.css'

let deck = new Reveal({
   
})

deck.initialize({
  highlight: {

  },
  plugins: [ Markdown, RevealHighlight, Notes]
});

deck.on( 'make-it-pop', () => {
  console.log('✨');
} );