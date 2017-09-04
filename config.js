module.exports = {
    cosmicjs: {
        bucket: {
            slug: process.env.COSMIC_BUCKET || 'comsic-static-multi-lang-app',
            read_key: process.env.COSMIC_READ_KEY,
            write_key: process.env.COSMIC_WRITE_KEY
        }
    },
    lang: {
        defaultLocale: 'en-US'
    },
    fetch: {
        file: 'src/cosmic-data.json',
        cache: false,
        NodeWhiteList: ['locale', 'slug', 'content'],
        NodeAllowedTags: ['a', 'b', 'i', 'span', 'sub', 'sup', 'abbr', 'acronym', 'cite', 'code', 'dfn', 'em', 'kbd', 'strong', 'samp', 'var']
    }
}