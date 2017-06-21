
import { I18n } from '../../src/i18n/I18n'

describe("i18n", () => {

    let pepe = 1;

    beforeEach(() => {

        console.log('hola', pepe);
        pepe ++;
    })

    it("Should detect user locale", () => {

        const i18n = new I18n({});

        expect(i18n.decideUserLocale({})).toBe('en');
    });

    it("should be tru", () => {

        expect(true).toBe(true);
    })
})