import { IEntity } from '@punica/common';
import { Title, Initialize } from '@punica/form-model';
import { FormItemA, FormItemB } from '../../formItems';
import property7 from './items/property7';
import property8 from './items/property8';
import initializer from './initializer';

@Title('D Form')
@Initialize(initializer)
class FormD implements IEntity {
  @FormItemA(property7)
  public property7 = 'property7';
  @FormItemB(property8)
  public property8 = {
    value: 'sezgin',
    label: 'label'
  };

  public id = '';
}

export default FormD;
