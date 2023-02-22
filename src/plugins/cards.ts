import BasePlugin from "../class/basePlugin";

export default class Plugin extends BasePlugin {
  constructor(id: string, options: ObjectAny = {}) {
    super(id, options);
  }

  style = async () => {
    return `
    ul.cards {
        display: grid;
        grid-auto-columns: minmax(0, 1fr);
        grid-gap: 1rem;
        padding: 0;
        margin: auto;
        margin-bottom: 4rem;
        width: fit-content;

        &.center {
            text-align: center;
        }

        ul {
            padding: 0;
        }

        hr {
            border-top: 1px solid var(--muted-border-color);
            width: 100%;
        }

        &> li {
            list-style: none;
            background: var(--card-background-color);
            padding: 1.5rem;
            border-radius: var(--border-radius);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            
            h1, h2, h3, h4, h5, h6 {
                margin-top: 0;
                text-align: center;
            }

            li {
                list-style: none;
                font-size: 16px;
            }

            li:last-child {
                a, button {
                    margin: 0 auto;
                    margin-top: 2rem;
                    list-style: none;
                    width: auto;
                    display: flex;
                    align-items: center;
                }
            }
        }
    }


    @media (max-width: 577px){
        ul.cards {
            width: auto;
        }
    }
    @media (min-width: 992px){
        ul.cards {
            grid-auto-flow: column;
        }
    }
  `;
  };
}


