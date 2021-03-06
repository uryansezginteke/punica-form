import { IEntity } from '@punica/common';
import { IForm, IFormItem } from '@punica/form-model';
import BaseReader from '../base';

class Reader<E extends IEntity, F extends IFormItem> extends BaseReader<E, F> {
  /**
   *
   * @param items
   */
  private async readItemsData(items: Array<F>, entity: E) {
    await items.forEach(async (item: F) => {
      const { hiddenChecking } = item;

      if (hiddenChecking) {
        const hidden = await hiddenChecking({
          formItem: item,
          readItems: this.readItems,
          entity
        });

        item.hidden = hidden;
      }
    });
  }

  /**
   *
   * @param entity
   * @returns
   */
  public async read(entity: E): Promise<IForm<F>> {
    const form: IForm<F> = await super.read(entity);

    this.readItemsData(form.items, entity);

    return form;
  }
}

export default Reader;
