// Reuse the phone breakpoints on tablets while preserving the original wide view.
(() => {
    const tablet = window.matchMedia('(min-width: 601px) and (max-width: 1200px)');
    const storageKey = 'pilgrimageTabletLayout';
    let preference = 'phone';
    try { preference = localStorage.getItem(storageKey) === 'wide' ? 'wide' : 'phone'; } catch (_) {}

    const stylesheet = document.getElementById('surveyStyles');
    const queries = [];
    function collect(rules) {
        Array.from(rules).forEach(rule => {
            if (rule.type === CSSRule.MEDIA_RULE) {
                const original = rule.media.mediaText;
                if (/\((?:min|max)-width:\s*\d+px\)/.test(original)) {
                    // Evaluate only width constraints at a normal phone width.
                    // Other conditions (for example reduced motion) stay intact.
                    const phone = original.replace(/\((min|max)-width:\s*(\d+)px\)/g,
                        (_, bound, width) => (bound === 'min' ? 390 >= Number(width) : 390 <= Number(width))
                            ? '(min-width: 0px)' : '(max-width: 0px)');
                    queries.push({ rule, original, phone });
                }
            }
            if (rule.cssRules) collect(rule.cssRules);
        });
    }

    window.isSurveyPhoneLayout = () => window.matchMedia('(max-width: 600px)').matches
        || (tablet.matches && preference === 'phone');

    function apply() {
        const phone = tablet.matches && preference === 'phone';
        queries.forEach(query => { query.rule.media.mediaText = phone ? query.phone : query.original; });
        const control = document.getElementById('tabletLayoutControl');
        if (control) {
            control.hidden = !tablet.matches;
            const toggle = document.getElementById('tabletLayoutToggle');
            const label = preference === 'phone' ? 'Switch to tablet view' : 'Switch to phone view';
            toggle.setAttribute('aria-label', label);
            toggle.setAttribute('title', label);
            toggle.setAttribute('aria-pressed', String(preference === 'wide'));
            toggle.querySelector('.layout-icon-tablet').toggleAttribute('hidden', preference === 'wide');
            toggle.querySelector('.layout-icon-phone').toggleAttribute('hidden', preference === 'phone');
        }
        if (document.readyState !== 'loading' && window.enhanceJourneySelectButtons) {
            window.enhanceJourneySelectButtons();
        }
    }

    function initializeStyles() {
        collect(stylesheet.sheet.cssRules);
        apply();
    }
    if (stylesheet.sheet) initializeStyles();
    else stylesheet.addEventListener('load', initializeStyles, { once: true });
    tablet.addEventListener('change', apply);
    document.addEventListener('DOMContentLoaded', () => {
        document.getElementById('tabletLayoutToggle').addEventListener('click', () => {
            preference = preference === 'phone' ? 'wide' : 'phone';
            try { localStorage.setItem(storageKey, preference); } catch (_) {}
            apply();
        });
        apply();
    });
})();
