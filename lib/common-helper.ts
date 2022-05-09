import { name, version } from '../package.json';
import { format, Options } from 'prettier';
import { parse } from 'path';
import { ContentTypeElements, TaxonomyModels } from '@kentico/kontent-management';

export interface IGenerateResult {
    filenames: string[];
}

export class CommonHelper {
    getAutogenerateNote(addTimestamp: boolean): string {
        if (addTimestamp) {
            return `Generated by '${name}@${version}' at '${new Date().toUTCString()}'`;
        }

        return `Generated by '${name}@${version}'`;
    }

    isElementRequired(element: ContentTypeElements.ContentTypeElementModel): boolean {
        const isRequired = (<any>element)['is_required'];

        return isRequired === true;
    }

    getElementGuidelines(element: ContentTypeElements.ContentTypeElementModel): string | null {
        const guidelines = (<any>element)['guidelines'];

        if (!guidelines) {
            return null;
        }

        return guidelines;
    }

    getElementTitle(
        element: ContentTypeElements.ContentTypeElementModel,
        taxonomies: TaxonomyModels.Taxonomy[]
    ): string | null {
        if (element.type === 'taxonomy') {
            const taxonomyElement = element as ContentTypeElements.ITaxonomyElement;
            const taxonomyGroupId = taxonomyElement?.taxonomy_group?.id;

            if (!taxonomyGroupId) {
                return element.type;
            }

            const taxonomy = taxonomies.find((m) => m.id === taxonomyGroupId);

            if (!taxonomy) {
                return element.type;
            }

            return taxonomy.name;
        }
        return (<any>element)['name'];
    }

    getBarrelExportCode(data: { filenames: string[]; formatOptions?: Options }): string {
        let code = '';

        for (let i = 0; i < data.filenames.length; i++) {
            const isLast = i === data.filenames.length - 1;
            const filename = data.filenames[i];
            const path = parse(filename);
            code += `export * from '${path.dir}/${path.name}'`;

            if (!isLast) {
                code += `\n`;
            }
        }

        const formatOptions: Options = data.formatOptions
            ? data.formatOptions
            : {
                  parser: 'typescript',
                  singleQuote: true
              };

        // beautify code
        return format(code, formatOptions);
    }

    escapeNameValue(value: string): string {
        return value.replace('\'', '\\\'');
    }
}

export const commonHelper = new CommonHelper();
