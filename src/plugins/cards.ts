import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
  }

  style = async () => {
    return `

    div.cards, ul.cards {
        border-radius: var(--border-radius);
    }
    
    div.cards {
        background: var(--card-background-color);
        padding: var(--spacing);

        > :first-child {
            margin-top: 0;
        }
        > :last-child {
            margin-bottom: 0;
        }

        &:has(ul:only-child) {
            padding: 0;
            background: transparent;
        }

        &.preview {
            margin-top: calc(var(--spacing) * 1);
            margin-bottom: calc(var(--spacing) * 2)
        }
    }

    ul.cards {
        display: grid;
        grid-gap: 1rem;
        grid-auto-columns: minmax(0, 1fr);
        padding: 0;
        margin: auto;
        margin-bottom: var(--spacing);

        &.center {
            text-align: center;
        }

        ul {
            padding: 0;
            margin-top: 0;
            display: grid;
            justify-content: inherit;
            align-items: center;
        }

        hr {
            border-top: 1px solid var(--muted-border-color);
            width: 30%;
        }

        a {
            text-decoration: none;
        }

        &:has(li.shadow){
            box-shadow: none;
        }

        &> li {
            list-style: none;
            background: var(--card-background-color);
            
            margin: 0;
            padding: var(--spacing);
            border-radius: var(--border-radius);
            border: 3px solid transparent;
            display: grid;
            flex-direction: column;
            justify-content: stretch;
            
            h1, h2, h3, h4, h5, h6 {
                margin-top: 0;
            }

            li {
                list-style: none;
            }

            li:last-child {
                margin-bottom: 0;
                // a, button {
                //     margin: 0 auto;
                //     margin-top: 2rem;
                //     list-style: none;
                //     width: auto;
                //     display: flex;
                //     align-items: center;
                // }
            }

            &:hover {
                border-color: var(--primary);
            }

            a:only-child {
                margin: calc(var(--spacing) * -1);
                padding: var(--spacing);
            }
        }

        &.v-center {
            &> li {
                justify-content: center;
            }
        }

        &.grid-auto {
            grid-auto-flow: column;
        }
        &.grid-2,&.grid-3,&.grid-4,&.grid-5 {
            grid-auto-flow: unset;
        }
        &.grid-2 {
            grid-template-columns: minmax(100px, 1fr) minmax(100px, 1fr);
        }
        &.grid-3 {
            grid-template-columns: minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr);
        }
        &.grid-4 {
            grid-template-columns: minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr);
        }
        &.grid-5 {
            grid-template-columns: minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr) minmax(100px, 1fr);
        }
        
    }




    @media (max-width: 577px){
        ul.cards {
            width: auto;
        }
    }
    @media (max-width: 1199px){
        ul.cards:not(.fixed) {
            grid-template-columns: max-content;
            grid-auto-flow: unset;
            justify-content: center;
        }
    }
  `;
  };
}
